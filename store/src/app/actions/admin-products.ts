"use server";

import { after } from "next/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/email/send";
import { backInStockEmail } from "@/lib/email/templates";
import { isAvailable } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { deleteImage } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import { productSchema, type ProductInput } from "@/lib/validation";

export type SaveResult = { ok: false; message: string; fieldErrors?: Record<string, string> } | { ok: true; id: string };

async function uniqueSlug(base: string, excludeId?: string) {
  const root = slugify(base) || "product";
  let slug = root;
  for (let i = 2; ; i++) {
    const clash = await db.product.findFirst({ where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) }, select: { id: true } });
    if (!clash) return slug;
    slug = `${root}-${i}`;
  }
}

function revalidateStore(slug?: string) {
  revalidatePath("/", "layout");
  if (slug) revalidatePath(`/product/${slug}`);
}

export async function saveProduct(id: string | null, input: ProductInput): Promise<SaveResult> {
  await requireAdmin();
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }
  const { images, slug: requestedSlug, ...data } = parsed.data;

  if (data.categoryId) {
    const cat = await db.category.findUnique({ where: { id: data.categoryId }, select: { id: true } });
    if (!cat) return { ok: false, message: "Selected category no longer exists." };
  }

  const existing = id ? await db.product.findUnique({ where: { id }, include: { images: true } }) : null;
  if (id && !existing) return { ok: false, message: "Product not found." };

  const slug = await uniqueSlug(requestedSlug || data.name, id ?? undefined);
  const imageRows = images.map((img, position) => ({
    url: img.url,
    storageId: img.storageId ?? null,
    alt: img.alt ?? null,
    width: img.width ?? null,
    height: img.height ?? null,
    position,
  }));

  try {
    const product = await db.$transaction(async (tx) => {
      if (existing) {
        await tx.productImage.deleteMany({ where: { productId: existing.id } });
        return tx.product.update({ where: { id: existing.id }, data: { ...data, slug, images: { create: imageRows } } });
      }
      return tx.product.create({ data: { ...data, slug, images: { create: imageRows } } });
    });

    // Remove files for images that were deleted in the editor
    if (existing) {
      const kept = new Set(images.map((i) => i.storageId).filter(Boolean));
      const removed = existing.images.filter((i) => i.storageId && !kept.has(i.storageId));
      for (const r of removed) {
        // Keep files still referenced by another product (e.g. a duplicate)
        const stillUsed = await db.productImage.count({ where: { url: r.url } });
        if (!stillUsed) after(() => deleteImage(r.storageId));
      }
    }

    // Back in stock → email everyone who asked to be notified
    if (existing && !isAvailable(existing) && isAvailable(product) && product.active) {
      after(() => notifyBackInStock(product.id));
    }

    revalidateStore(product.slug);
    if (existing && existing.slug !== product.slug) revalidatePath(`/product/${existing.slug}`);
    return { ok: true, id: product.id };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      return { ok: false, message: "That URL slug is already used.", fieldErrors: { slug: "Already in use" } };
    }
    console.error("[product] save failed", e);
    return { ok: false, message: "Could not save the product." };
  }
}

async function notifyBackInStock(productId: string) {
  const [product, settings] = await Promise.all([
    db.product.findUnique({ where: { id: productId }, select: { name: true, slug: true } }),
    getSettings(),
  ]);
  if (!product) return;
  const requests = await db.stockNotification.findMany({ where: { productId, notifiedAt: null, email: { not: null } }, take: 200 });
  const msg = backInStockEmail(product, settings.storeName);
  for (const r of requests) {
    const res = await sendEmail({ to: r.email!, ...msg });
    if (res.ok) await db.stockNotification.update({ where: { id: r.id }, data: { notifiedAt: new Date() } });
  }
}

export async function duplicateProduct(id: string) {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id }, include: { images: { orderBy: { position: "asc" } } } });
  if (!p) return;
  const slug = await uniqueSlug(`${p.slug}-copy`);
  const copy = await db.product.create({
    data: {
      name: `${p.name} (copy)`,
      slug,
      description: p.description,
      details: p.details,
      price: p.price,
      salePrice: p.salePrice,
      stock: 0,
      soldOut: p.soldOut,
      featured: false,
      newArrival: p.newArrival,
      active: false, // hidden until reviewed
      color: p.color,
      material: p.material,
      dimensions: p.dimensions,
      strapDetails: p.strapDetails,
      categoryId: p.categoryId,
      // Images are shared by URL; storageId is omitted so deleting the copy never deletes the original's files
      images: { create: p.images.map((i) => ({ url: i.url, alt: i.alt, width: i.width, height: i.height, position: i.position })) },
    },
  });
  revalidatePath("/admin/products");
  redirect(`/admin/products/${copy.id}?duplicated=1`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const p = await db.product.findUnique({ where: { id }, include: { images: true } });
  if (!p) redirect("/admin/products");
  await db.product.delete({ where: { id } });
  // Only delete stored files no other product still references
  for (const img of p.images) {
    if (!img.storageId) continue;
    const shared = await db.productImage.count({ where: { url: img.url } });
    if (!shared) after(() => deleteImage(img.storageId));
  }
  revalidateStore(p.slug);
  redirect("/admin/products?deleted=1");
}

const quickSchema = z.object({ id: z.string().min(1).max(40), stock: z.number().int().min(0).max(100000) });

export async function quickUpdateStock(id: string, stock: number) {
  await requireAdmin();
  const parsed = quickSchema.safeParse({ id, stock });
  if (!parsed.success) return { ok: false };
  const before = await db.product.findUnique({ where: { id } });
  if (!before) return { ok: false };
  const after_ = await db.product.update({ where: { id }, data: { stock: parsed.data.stock } });
  if (!isAvailable(before) && isAvailable(after_) && after_.active) after(() => notifyBackInStock(id));
  revalidateStore(after_.slug);
  return { ok: true };
}

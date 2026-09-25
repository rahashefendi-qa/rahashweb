"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { NEW_ARRIVALS_SLUG } from "@/lib/products";
import { slugify } from "@/lib/utils";

export type CatResult = { ok: boolean; message: string } | null;

const schema = z.object({
  id: z.string().max(40).optional(),
  name: z.string().trim().min(2, "Name is required").max(60),
  slug: z.string().trim().max(60).optional(),
  description: z.string().trim().max(300).optional(),
  position: z.coerce.number().int().min(0).max(999).default(0),
});

export async function saveCategory(_: CatResult, formData: FormData): Promise<CatResult> {
  await requireAdmin();
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  const { id, name, description, position } = parsed.data;
  const slug = slugify(parsed.data.slug || name);
  if (!slug || slug === NEW_ARRIVALS_SLUG) return { ok: false, message: "Choose a different URL slug." };
  const clash = await db.category.findFirst({ where: { slug, ...(id ? { id: { not: id } } : {}) } });
  if (clash) return { ok: false, message: "Another category already uses this URL." };

  const data = { name, slug, description: description || null, position };
  if (id) await db.category.update({ where: { id }, data });
  else await db.category.create({ data });
  revalidatePath("/", "layout");
  return { ok: true, message: id ? "Category updated." : "Category created." };
}

export async function deleteCategory(id: string) {
  await requireAdmin();
  // Products in this category are kept and become uncategorised.
  await db.category.delete({ where: { id } }).catch(() => null);
  revalidatePath("/", "layout");
}

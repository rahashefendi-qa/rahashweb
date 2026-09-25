import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { db } from "./db";

export const NEW_ARRIVALS_SLUG = "new-arrivals";

const cardSelect = {
  id: true,
  name: true,
  slug: true,
  price: true,
  salePrice: true,
  stock: true,
  soldOut: true,
  newArrival: true,
  createdAt: true,
  category: { select: { name: true, slug: true } },
  images: { orderBy: { position: "asc" }, take: 2, select: { url: true, alt: true } },
} satisfies Prisma.ProductSelect;

type CardRow = Prisma.ProductGetPayload<{ select: typeof cardSelect }>;

export type ProductCardData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  available: boolean;
  stock: number;
  newArrival: boolean;
  category: string | null;
  image: { url: string; alt: string } | null;
  hoverImage: { url: string; alt: string } | null;
};

export function isAvailable(p: { soldOut: boolean; stock: number; active?: boolean }) {
  return (p.active ?? true) && !p.soldOut && p.stock > 0;
}

export { effectivePriceOf as effectivePrice } from "./price";
import { effectivePriceOf as effectivePrice } from "./price";

function toCard(p: CardRow): ProductCardData {
  const [a, b] = p.images;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    available: isAvailable(p),
    stock: p.stock,
    newArrival: p.newArrival,
    category: p.category?.name ?? null,
    image: a ? { url: a.url, alt: a.alt || p.name } : null,
    hoverImage: b ? { url: b.url, alt: b.alt || p.name } : null,
  };
}

export type ShopQuery = {
  q?: string;
  category?: string;
  min?: number; // cents
  max?: number; // cents
  sort?: "newest" | "price-asc" | "price-desc";
  availability?: "in-stock" | "all";
};

export async function listProducts(query: ShopQuery = {}) {
  const where: Prisma.ProductWhereInput = { active: true };
  if (query.q) {
    where.OR = [
      { name: { contains: query.q, mode: "insensitive" } },
      { description: { contains: query.q, mode: "insensitive" } },
      { color: { contains: query.q, mode: "insensitive" } },
      { material: { contains: query.q, mode: "insensitive" } },
    ];
  }
  if (query.category === NEW_ARRIVALS_SLUG) where.newArrival = true;
  else if (query.category) where.category = { slug: query.category };
  if (query.availability === "in-stock") {
    where.soldOut = false;
    where.stock = { gt: 0 };
  }

  const rows = await db.product.findMany({
    where,
    select: cardSelect,
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  // Price filtering/sorting uses the effective (sale) price, so it is done in memory.
  let cards = rows.map(toCard);
  if (query.min != null) cards = cards.filter((c) => effectivePrice(c) >= query.min!);
  if (query.max != null) cards = cards.filter((c) => effectivePrice(c) <= query.max!);
  if (query.sort === "price-asc") cards.sort((a, b) => effectivePrice(a) - effectivePrice(b));
  if (query.sort === "price-desc") cards.sort((a, b) => effectivePrice(b) - effectivePrice(a));
  // Available products first, keeping the chosen order otherwise.
  if (query.sort !== "price-asc" && query.sort !== "price-desc") {
    cards = [...cards.filter((c) => c.available), ...cards.filter((c) => !c.available)];
  }
  return cards;
}

export async function getFeaturedProducts(limit = 8) {
  const rows = await db.product.findMany({
    where: { active: true },
    select: cardSelect,
    orderBy: [{ featured: "desc" }, { newArrival: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  return rows.map(toCard);
}

export const getProductBySlug = cache(async (slug: string) => {
  return db.product.findFirst({
    where: { slug, active: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      images: { orderBy: { position: "asc" } },
    },
  });
});

export async function getRelatedProducts(product: { id: string; categoryId: string | null }, limit = 4) {
  const rows = await db.product.findMany({
    where: { active: true, id: { not: product.id }, ...(product.categoryId ? { categoryId: product.categoryId } : {}) },
    select: cardSelect,
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
    take: limit,
  });
  if (rows.length < limit) {
    const more = await db.product.findMany({
      where: { active: true, id: { notIn: [product.id, ...rows.map((r) => r.id)] } },
      select: cardSelect,
      orderBy: { createdAt: "desc" },
      take: limit - rows.length,
    });
    rows.push(...more);
  }
  return rows.map(toCard);
}

export const getCategories = cache(async () => {
  return db.category.findMany({
    orderBy: { position: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      _count: { select: { products: { where: { active: true } } } },
      products: {
        where: { active: true },
        take: 1,
        orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
        select: { images: { orderBy: { position: "asc" }, take: 1, select: { url: true } } },
      },
    },
  });
});

/** Minimal product data the cart needs to re-validate itself. */
export async function getCartProducts(ids: string[]) {
  const rows = await db.product.findMany({
    where: { id: { in: ids.slice(0, 50) } },
    select: {
      id: true, name: true, slug: true, price: true, salePrice: true, stock: true, soldOut: true, active: true,
      images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
    },
  });
  return rows.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    unitPrice: effectivePrice(p),
    stock: p.stock,
    available: isAvailable(p),
    image: p.images[0]?.url ?? null,
  }));
}

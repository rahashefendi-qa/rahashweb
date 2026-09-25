"use server";

import { z } from "zod";
import { getProductBySlug, isAvailable } from "@/lib/products";

export type QuickViewData = {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice: number | null;
  stock: number;
  available: boolean;
  description: string;
  color: string | null;
  dimensions: string | null;
  images: { url: string; alt: string }[];
};

export async function getQuickView(slug: string): Promise<QuickViewData | null> {
  const parsed = z.string().min(1).max(120).safeParse(slug);
  if (!parsed.success) return null;
  const p = await getProductBySlug(parsed.data);
  if (!p) return null;
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    stock: p.stock,
    available: isAvailable(p),
    description: p.description,
    color: p.color,
    dimensions: p.dimensions,
    images: p.images.slice(0, 5).map((i) => ({ url: i.url, alt: i.alt || p.name })),
  };
}

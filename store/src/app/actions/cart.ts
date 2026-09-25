"use server";

import { z } from "zod";
import { getCartProducts } from "@/lib/products";

/** Returns fresh price/stock data so the cart never shows stale information. */
export async function refreshCart(ids: string[]) {
  const parsed = z.array(z.string().min(1).max(40)).max(50).safeParse(ids);
  if (!parsed.success || parsed.data.length === 0) return [];
  return getCartProducts(parsed.data);
}

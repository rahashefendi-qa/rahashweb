/** Client-safe copy of the effective-price rule (see lib/products.ts). */
export function effectivePriceOf(p: { price: number; salePrice: number | null }) {
  return p.salePrice != null && p.salePrice < p.price ? p.salePrice : p.price;
}

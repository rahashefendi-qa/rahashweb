import type { ShopQuery } from "./products";

type Params = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/** Parse & sanitise shop URL search params. */
export function parseShopParams(sp: Params): ShopQuery {
  const q = one(sp.q)?.trim().slice(0, 80) || undefined;
  const category = one(sp.category)?.slice(0, 60) || undefined;
  const min = Number(one(sp.min));
  const max = Number(one(sp.max));
  const sort = one(sp.sort);
  return {
    q,
    category,
    min: Number.isFinite(min) && min > 0 ? Math.round(min * 100) : undefined,
    max: Number.isFinite(max) && max > 0 ? Math.round(max * 100) : undefined,
    sort: sort === "price-asc" || sort === "price-desc" ? sort : "newest",
    availability: one(sp.availability) === "in-stock" ? "in-stock" : "all",
  };
}

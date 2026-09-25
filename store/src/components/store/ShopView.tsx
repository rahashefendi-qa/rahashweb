import { Suspense } from "react";
import { listProducts, getCategories, type ShopQuery } from "@/lib/products";
import { ProductGrid } from "./ProductGrid";
import { Reveal } from "./Reveal";
import { ShopFilters } from "./ShopFilters";

export async function ShopView({
  title,
  eyebrow,
  intro,
  query,
  lockedCategory = false,
}: {
  title: string;
  eyebrow: string;
  intro?: string | null;
  query: ShopQuery;
  lockedCategory?: boolean;
}) {
  const [products, categories] = await Promise.all([listProducts(query), getCategories()]);

  return (
    <div className="container-x pt-28 md:pt-36">
      <Reveal className="mb-10 md:mb-14">
        <p className="eyebrow text-brass-soft">{eyebrow}</p>
        <h1 className="display mt-3 text-[clamp(3rem,8vw,6.5rem)]">{title}</h1>
        {intro && <p className="mt-4 max-w-lg text-stone">{intro}</p>}
      </Reveal>
      <Suspense>
        <ShopFilters categories={categories.map((c) => ({ name: c.name, slug: c.slug }))} total={products.length} lockedCategory={lockedCategory}>
          {products.length ? (
            <ProductGrid products={products} priorityCount={4} />
          ) : (
            <div className="border border-dashed border-line px-6 py-24 text-center">
              <p className="display text-3xl">No pieces found</p>
              <p className="mt-3 text-sm text-stone">Try a different search or clear your filters.</p>
            </div>
          )}
        </ShopFilters>
      </Suspense>
    </div>
  );
}

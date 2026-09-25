import type { ProductCardData } from "@/lib/products";
import { ProductCard } from "./ProductCard";
import { Reveal } from "./Reveal";

export function ProductGrid({ products, priorityCount = 0 }: { products: ProductCardData[]; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-10 md:grid-cols-3 md:gap-x-6 md:gap-y-14 xl:grid-cols-4">
      {products.map((p, i) => (
        <Reveal key={p.id} delay={(i % 4) * 0.08}>
          <ProductCard product={p} priority={i < priorityCount} />
        </Reveal>
      ))}
    </div>
  );
}

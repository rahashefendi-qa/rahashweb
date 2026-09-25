"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Plus } from "lucide-react";
import { useCart } from "@/lib/cart-store";
import { effectivePriceOf } from "@/lib/price";
import type { ProductCardData } from "@/lib/products";
import { Price } from "@/components/ui/Price";
import { Badge } from "./Badge";
import { QuickView } from "./QuickView";
import { useStore } from "./StoreProvider";

export function ProductCard({ product, priority = false }: { product: ProductCardData; priority?: boolean }) {
  const { currency } = useStore();
  const add = useCart((s) => s.add);
  const [quick, setQuick] = useState(false);
  const onSale = product.salePrice != null && product.salePrice < product.price;

  function addToCart() {
    add({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: product.image?.url ?? null,
      unitPrice: effectivePriceOf(product),
      maxQty: product.stock,
    });
  }

  return (
    <article className="group relative">
      <div className="relative aspect-[4/5] overflow-hidden bg-bone">
        <Link href={`/product/${product.slug}`} aria-label={product.name} className="absolute inset-0">
          {product.image ? (
            <>
              <Image
                src={product.image.url}
                alt={product.image.alt}
                fill
                priority={priority}
                sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                className={`object-cover transition-[transform,opacity] duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-[1.04] ${product.hoverImage ? "md:group-hover:opacity-0" : ""} ${product.available ? "" : "grayscale-[35%]"}`}
              />
              {product.hoverImage && (
                <Image
                  src={product.hoverImage.url}
                  alt=""
                  fill
                  sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
                  className="hidden object-cover opacity-0 transition-[transform,opacity] duration-[1.2s] ease-[var(--ease-luxe)] group-hover:scale-[1.04] group-hover:opacity-100 md:block"
                />
              )}
            </>
          ) : (
            <div className="grid h-full place-items-center text-xs text-ash">No image</div>
          )}
        </Link>

        <div className="pointer-events-none absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {!product.available && <Badge tone="dark">Sold out</Badge>}
          {product.available && product.newArrival && <Badge>New</Badge>}
          {product.available && onSale && <Badge tone="brass">Sale</Badge>}
        </div>

        {/* Actions: always visible on touch, slide up on hover for desktop */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 transition-all duration-500 ease-[var(--ease-luxe)] md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100">
          <button
            onClick={() => setQuick(true)}
            className="grid h-10 w-10 place-items-center bg-paper/90 text-ink backdrop-blur transition hover:bg-paper md:h-11 md:flex-1 md:gap-2 md:text-[0.65rem] md:uppercase md:tracking-[0.2em] md:flex md:items-center md:justify-center"
            aria-label={`Quick view ${product.name}`}
          >
            <Eye size={15} strokeWidth={1.5} />
            <span className="hidden md:inline">Quick view</span>
          </button>
          {product.available && (
            <motion.button
              whileTap={{ scale: 0.94 }}
              onClick={addToCart}
              className="ml-auto grid h-10 w-10 place-items-center bg-ink/90 text-paper backdrop-blur transition hover:bg-ink md:ml-0 md:h-11 md:w-11"
              aria-label={`Add ${product.name} to cart`}
            >
              <Plus size={16} strokeWidth={1.5} />
            </motion.button>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-[0.95rem] leading-snug">
            <Link href={`/product/${product.slug}`} className="transition hover:text-brass-soft">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-xs text-ash">{product.available ? (product.category ?? "Available") : "Sold out"}</p>
        </div>
        <Price price={product.price} salePrice={product.salePrice} currency={currency} className="shrink-0 text-sm text-stone" />
      </div>

      <QuickView slug={product.slug} open={quick} onClose={() => setQuick(false)} />
    </article>
  );
}

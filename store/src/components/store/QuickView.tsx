"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { getQuickView, type QuickViewData } from "@/app/actions/products";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { useCart } from "@/lib/cart-store";
import { effectivePriceOf } from "@/lib/price";
import { cn } from "@/lib/utils";
import { useStore } from "./StoreProvider";

export function QuickView({ slug, open, onClose }: { slug: string; open: boolean; onClose: () => void }) {
  const { currency } = useStore();
  const add = useCart((s) => s.add);
  const [data, setData] = useState<QuickViewData | null>(null);
  const [error, setError] = useState(false);
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (!open) return;
    setError(false);
    if (!data) getQuickView(slug).then((d) => (d ? setData(d) : setError(true))).catch(() => setError(true));
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, slug, data, onClose]);

  function addToCart() {
    if (!data) return;
    add(
      { productId: data.id, slug: data.slug, name: data.name, image: data.images[0]?.url ?? null, unitPrice: effectivePriceOf(data), maxQty: data.stock },
      qty,
    );
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-sm md:items-center md:p-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={data?.name ?? "Quick view"}
            className="relative grid max-h-[92dvh] w-full max-w-4xl overflow-y-auto bg-coal md:grid-cols-2"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={onClose} className="absolute right-3 top-3 z-10 bg-ink/60 p-2 text-paper backdrop-blur" aria-label="Close">
              <X size={18} strokeWidth={1.4} />
            </button>

            {!data && !error && (
              <>
                <div className="skeleton aspect-[4/5]" />
                <div className="space-y-4 p-8">
                  <div className="skeleton h-8 w-2/3" />
                  <div className="skeleton h-4 w-1/4" />
                  <div className="skeleton h-24 w-full" />
                </div>
              </>
            )}
            {error && <p className="col-span-2 p-10 text-center text-stone">This product could not be loaded.</p>}

            {data && (
              <>
                <div>
                  <div className="relative aspect-[4/5] bg-bone">
                    <AnimatePresence mode="wait">
                      <motion.div key={active} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                        {data.images[active] && (
                          <Image src={data.images[active].url} alt={data.images[active].alt} fill sizes="(min-width: 768px) 448px, 100vw" className="object-cover" />
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                  {data.images.length > 1 && (
                    <div className="flex gap-1 p-1">
                      {data.images.map((img, i) => (
                        <button
                          key={img.url}
                          onClick={() => setActive(i)}
                          className={cn("relative aspect-square w-14 bg-bone transition", i === active ? "opacity-100 ring-1 ring-paper" : "opacity-50 hover:opacity-80")}
                          aria-label={`Image ${i + 1}`}
                        >
                          <Image src={img.url} alt="" fill sizes="56px" className="object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex flex-col p-6 md:p-10">
                  <h2 className="display text-4xl">{data.name}</h2>
                  <Price price={data.price} salePrice={data.salePrice} currency={currency} className="mt-3 text-lg text-stone" />
                  <p className={cn("eyebrow mt-4", data.available ? "text-success" : "text-danger")}>
                    {data.available ? (data.stock <= 3 ? `Only ${data.stock} left` : "In stock") : "Sold out"}
                  </p>
                  <p className="mt-6 line-clamp-5 text-sm leading-relaxed text-stone">{data.description}</p>
                  <dl className="mt-6 space-y-1 text-xs text-ash">
                    {data.color && <div><dt className="inline">Colour: </dt><dd className="inline text-stone">{data.color}</dd></div>}
                    {data.dimensions && <div><dt className="inline">Dimensions: </dt><dd className="inline text-stone">{data.dimensions}</dd></div>}
                  </dl>
                  <div className="mt-auto space-y-3 pt-8">
                    {data.available ? (
                      <div className="flex gap-3">
                        <QtyStepper value={qty} max={Math.min(data.stock, 10)} onChange={setQty} />
                        <Button className="flex-1" onClick={addToCart}>Add to cart</Button>
                      </div>
                    ) : (
                      <Button className="w-full" disabled>Sold out</Button>
                    )}
                    <Link href={`/product/${data.slug}`} className="eyebrow block text-center text-stone underline-offset-8 hover:text-paper hover:underline">
                      View full details
                    </Link>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

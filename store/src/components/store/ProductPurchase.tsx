"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { MAX_PER_LINE, useCart } from "@/lib/cart-store";
import { effectivePriceOf } from "@/lib/price";
import { NotifyMe } from "./NotifyMe";
import { useStore } from "./StoreProvider";

type Props = {
  product: { id: string; slug: string; name: string; price: number; salePrice: number | null; stock: number; image: string | null };
  available: boolean;
};

export function ProductPurchase({ product, available }: Props) {
  const router = useRouter();
  const { currency } = useStore();
  const add = useCart((s) => s.add);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const max = Math.min(product.stock, MAX_PER_LINE);

  // Sticky mobile bar appears once the main buttons scroll out of view
  useEffect(() => {
    const el = buttonsRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0), { threshold: 0 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function addToCart(openDrawer = true) {
    add(
      { productId: product.id, slug: product.slug, name: product.name, image: product.image, unitPrice: effectivePriceOf(product), maxQty: product.stock },
      qty,
    );
    if (!openDrawer) useCart.getState().setOpen(false);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  }

  function buyNow() {
    addToCart(false);
    router.push("/checkout");
  }

  if (!available) {
    return (
      <div className="space-y-6">
        <Button size="lg" className="w-full" disabled>Sold out</Button>
        <NotifyMe productId={product.id} />
      </div>
    );
  }

  return (
    <>
      <div ref={buttonsRef} className="space-y-3">
        <div className="flex gap-3">
          <QtyStepper value={qty} max={max} onChange={setQty} />
          <Button size="lg" className="flex-1" onClick={() => addToCart()}>
            <AnimatePresence mode="wait" initial={false}>
              {added ? (
                <motion.span key="ok" className="flex items-center gap-2" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                  <Check size={15} /> Added
                </motion.span>
              ) : (
                <motion.span key="add" initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}>
                  Add to cart
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
        <Button size="lg" variant="outline" className="w-full" onClick={buyNow}>
          Order now
        </Button>
        {product.stock <= 3 && <p className="text-xs text-brass-soft">Only {product.stock} left in stock.</p>}
      </div>

      <AnimatePresence>
        {showSticky && (
          <motion.div
            className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{product.name}</p>
                <Price price={product.price} salePrice={product.salePrice} currency={currency} className="text-xs text-stone" />
              </div>
              <Button onClick={() => addToCart()} variant="outline" size="md" className="px-4">Add</Button>
              <Button onClick={buyNow} size="md" className="px-5">Order now</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

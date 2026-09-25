"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/money";
import { useStore } from "./StoreProvider";
import { useCartSync } from "./useCartSync";

export function CartDrawer() {
  const { currency, freeDeliveryOver } = useStore();
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const [notice, setNotice] = useState<string | null>(null);
  useCartSync(open, (names) => setNotice(`${names.join(", ")} ${names.length > 1 ? "are" : "is"} no longer available and was removed.`));

  const subtotal = cartSubtotal(items);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.aside
            className="fixed inset-y-0 right-0 z-[71] flex w-full max-w-md flex-col bg-coal"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <p className="eyebrow">Your cart ({items.reduce((n, i) => n + i.quantity, 0)})</p>
              <button onClick={() => setOpen(false)} className="-mr-2 p-2 text-stone hover:text-paper" aria-label="Close cart">
                <X size={20} strokeWidth={1.4} />
              </button>
            </div>

            {notice && <p className="border-b border-line bg-graphite px-6 py-3 text-xs text-brass-soft">{notice}</p>}

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <p className="display text-3xl">Your cart is empty</p>
                <p className="mt-3 text-sm text-stone">Discover pieces made for everyday carry.</p>
                <ButtonLink href="/shop" className="mt-8" onClick={() => setOpen(false)}>
                  Shop the collection
                </ButtonLink>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.productId}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, height: 0, paddingTop: 0, paddingBottom: 0 }}
                        className="flex gap-4 overflow-hidden py-5"
                      >
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={() => setOpen(false)}
                          className="relative h-28 w-22 shrink-0 overflow-hidden bg-bone"
                        >
                          {item.image && <Image src={item.image} alt={item.name} fill sizes="88px" className="object-cover" />}
                        </Link>
                        <div className="flex flex-1 flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <Link href={`/product/${item.slug}`} onClick={() => setOpen(false)} className="text-sm leading-snug hover:text-brass-soft">
                              {item.name}
                            </Link>
                            <span className="text-sm tabular-nums">{formatPrice(item.unitPrice * item.quantity, currency)}</span>
                          </div>
                          <p className="mt-1 text-xs text-ash">{formatPrice(item.unitPrice, currency)} each</p>
                          <div className="mt-auto flex items-center justify-between pt-3">
                            <QtyStepper size="sm" value={item.quantity} max={Math.min(item.maxQty, 10)} onChange={(v) => setQty(item.productId, v)} />
                            <button onClick={() => remove(item.productId)} className="text-xs text-ash underline-offset-4 hover:text-paper hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
                <div className="space-y-4 border-t border-line px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone">Subtotal</span>
                    <span className="tabular-nums">{formatPrice(subtotal, currency)}</span>
                  </div>
                  <p className="text-xs text-ash">
                    Delivery calculated at checkout
                    {freeDeliveryOver ? ` · free over ${formatPrice(freeDeliveryOver, currency)}` : ""}.
                  </p>
                  <ButtonLink href="/checkout" size="lg" className="w-full" onClick={() => setOpen(false)}>
                    Checkout
                  </ButtonLink>
                  <div className="flex justify-between text-xs text-stone">
                    <button onClick={() => setOpen(false)} className="hover:text-paper">Continue shopping</button>
                    <Link href="/cart" onClick={() => setOpen(false)} className="hover:text-paper">View cart</Link>
                  </div>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { QtyStepper } from "@/components/ui/QtyStepper";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { computeDeliveryFee } from "@/lib/delivery";
import { formatPrice } from "@/lib/money";
import { useStore } from "./StoreProvider";
import { useCartSync } from "./useCartSync";

export function CartView() {
  const settings = useStore();
  const { items, hydrated, setQty, remove } = useCart();
  const [notice, setNotice] = useState<string | null>(null);
  useCartSync(true, (names) => setNotice(`${names.join(", ")} is no longer available and was removed from your cart.`));

  if (!hydrated) {
    return <div className="skeleton mt-10 h-64 w-full" />;
  }

  if (items.length === 0) {
    return (
      <div className="mt-10 border border-dashed border-line px-6 py-24 text-center">
        <p className="display text-3xl">Your cart is empty</p>
        <p className="mt-3 text-sm text-stone">Browse the collection and add your next everyday bag.</p>
        <ButtonLink href="/shop" size="lg" className="mt-8">Continue shopping</ButtonLink>
      </div>
    );
  }

  const subtotal = cartSubtotal(items);
  const delivery = computeDeliveryFee(settings, subtotal, null);

  return (
    <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_380px]">
      <div>
        {notice && <p className="mb-6 border border-line bg-graphite p-4 text-sm text-brass-soft">{notice}</p>}
        <ul className="divide-y divide-line border-y border-line">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li key={item.productId} layout exit={{ opacity: 0, height: 0 }} className="flex gap-5 overflow-hidden py-6">
                <Link href={`/product/${item.slug}`} className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden bg-bone md:w-32">
                  {item.image && <Image src={item.image} alt={item.name} fill sizes="128px" className="object-cover" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <Link href={`/product/${item.slug}`} className="hover:text-brass-soft md:text-lg">{item.name}</Link>
                    <span className="tabular-nums">{formatPrice(item.unitPrice * item.quantity, settings.currency)}</span>
                  </div>
                  <p className="mt-1 text-xs text-ash">{formatPrice(item.unitPrice, settings.currency)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <QtyStepper value={item.quantity} max={Math.min(item.maxQty, 10)} onChange={(v) => setQty(item.productId, v)} size="sm" />
                    <button onClick={() => remove(item.productId)} className="text-xs text-ash underline-offset-4 hover:text-paper hover:underline">Remove</button>
                  </div>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        <Link href="/shop" className="eyebrow mt-6 inline-block text-stone hover:text-paper">← Continue shopping</Link>
      </div>

      <aside className="h-fit border border-line p-6 lg:sticky lg:top-28">
        <p className="eyebrow text-ash">Summary</p>
        <dl className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal, settings.currency)}</dd></div>
          <div className="flex justify-between">
            <dt className="text-stone">Delivery</dt>
            <dd className="tabular-nums">{delivery === 0 ? "Free" : `from ${formatPrice(Math.min(delivery, ...Object.values(settings.governorateFees)), settings.currency)}`}</dd>
          </div>
          <div className="flex justify-between border-t border-line pt-4 text-base">
            <dt>Estimated total</dt>
            <dd className="tabular-nums">{formatPrice(subtotal + delivery, settings.currency)}</dd>
          </div>
        </dl>
        <p className="mt-3 text-xs text-ash">Final delivery fee depends on your governorate and is shown at checkout.</p>
        <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">Checkout</ButtonLink>
      </aside>
    </div>
  );
}

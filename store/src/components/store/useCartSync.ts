"use client";

import { useEffect, useRef } from "react";
import { refreshCart } from "@/app/actions/cart";
import { useCart, type CartItem } from "@/lib/cart-store";

/**
 * Re-validates cart lines against the database (price, stock, availability).
 * Returns nothing; updates the store in place and drops unavailable items.
 */
export function useCartSync(enabled: boolean, onRemoved?: (names: string[]) => void) {
  const hydrated = useCart((s) => s.hydrated);
  const ran = useRef(false);

  useEffect(() => {
    if (!enabled || !hydrated || ran.current) return;
    const items = useCart.getState().items;
    if (items.length === 0) return;
    ran.current = true;
    refreshCart(items.map((i) => i.productId))
      .then((fresh) => {
        const current = useCart.getState().items;
        const removed: string[] = [];
        const next: CartItem[] = [];
        for (const item of current) {
          const f = fresh.find((p) => p.id === item.productId);
          if (!f || !f.available) {
            removed.push(item.name);
            continue;
          }
          next.push({
            ...item,
            name: f.name,
            slug: f.slug,
            image: f.image,
            unitPrice: f.unitPrice,
            maxQty: f.stock,
            quantity: Math.min(item.quantity, f.stock),
          });
        }
        useCart.getState().replace(next);
        if (removed.length) onRemoved?.(removed);
      })
      .catch(() => {
        ran.current = false;
      });
  }, [enabled, hydrated, onRemoved]);

  useEffect(() => {
    if (!enabled) ran.current = false;
  }, [enabled]);
}

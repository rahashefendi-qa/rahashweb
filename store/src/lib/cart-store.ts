"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string | null;
  unitPrice: number; // cents — display only, the server recalculates at checkout
  quantity: number;
  maxQty: number;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  hydrated: boolean;
  add: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  replace: (items: CartItem[]) => void;
  setOpen: (open: boolean) => void;
};

export const MAX_PER_LINE = 10;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      hydrated: false,
      add: (item, qty = 1) =>
        set((s) => {
          const cap = Math.min(item.maxQty, MAX_PER_LINE);
          const existing = s.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              open: true,
              items: s.items.map((i) =>
                i.productId === item.productId ? { ...i, ...item, quantity: Math.min(cap, i.quantity + qty) } : i,
              ),
            };
          }
          return { open: true, items: [...s.items, { ...item, quantity: Math.min(cap, qty) }] };
        }),
      setQty: (productId, qty) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(qty, i.maxQty, MAX_PER_LINE)) } : i,
          ),
        })),
      remove: (productId) => set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      replace: (items) => set({ items }),
      setOpen: (open) => set({ open }),
    }),
    {
      name: "cart-v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ items: s.items }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
        useCart.setState({ hydrated: true });
      },
    },
  ),
);

export function cartCount(items: CartItem[]) {
  return items.reduce((n, i) => n + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
}

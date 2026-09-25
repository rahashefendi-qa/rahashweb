"use client";

import { createContext, useContext } from "react";
import type { PublicSettings } from "@/lib/settings";

const StoreContext = createContext<PublicSettings | null>(null);

export function StoreProvider({ settings, children }: { settings: PublicSettings; children: React.ReactNode }) {
  return <StoreContext.Provider value={settings}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}

import "server-only";
import { cache } from "react";
import type { Settings } from "@prisma/client";
import { db } from "./db";

/**
 * Settings live in a single row (id = 1). It is created on first access,
 * seeded from optional environment variables so a fresh deploy is usable.
 */
export const getSettings = cache(async (): Promise<Settings> => {
  const existing = await db.settings.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return db.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      storeName: process.env.STORE_NAME || "YOUR BRAND",
      adminEmail: process.env.ADMIN_EMAIL || null,
      storeEmail: process.env.STORE_EMAIL || null,
      phone: process.env.STORE_PHONE || null,
      whatsapp: process.env.STORE_WHATSAPP || null,
      wishMoneyNumber: process.env.WISH_MONEY_NUMBER || null,
      wishMoneyName: process.env.WISH_MONEY_NAME || null,
    },
  });
});

export type PublicSettings = Pick<
  Settings,
  | "storeName" | "tagline" | "logoUrl" | "storeEmail" | "phone" | "whatsapp" | "currency"
  | "deliveryFee" | "freeDeliveryOver" | "codEnabled" | "wishMoneyEnabled" | "wishMoneyName"
  | "wishMoneyNumber" | "wishMoneyInstructions" | "instagramUrl" | "facebookUrl" | "tiktokUrl"
> & { governorateFees: Record<string, number> };

/** Only fields that are safe to send to the browser. */
export function toPublicSettings(s: Settings): PublicSettings {
  return {
    storeName: s.storeName,
    tagline: s.tagline,
    logoUrl: s.logoUrl,
    storeEmail: s.storeEmail,
    phone: s.phone,
    whatsapp: s.whatsapp,
    currency: s.currency,
    deliveryFee: s.deliveryFee,
    governorateFees: parseGovernorateFees(s.governorateFees),
    freeDeliveryOver: s.freeDeliveryOver,
    codEnabled: s.codEnabled,
    wishMoneyEnabled: s.wishMoneyEnabled && !!s.wishMoneyNumber,
    wishMoneyName: s.wishMoneyName,
    wishMoneyNumber: s.wishMoneyNumber,
    wishMoneyInstructions: s.wishMoneyInstructions,
    instagramUrl: s.instagramUrl,
    facebookUrl: s.facebookUrl,
    tiktokUrl: s.tiktokUrl,
  };
}

export function parseGovernorateFees(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
    if (typeof v === "number" && Number.isInteger(v) && v >= 0) out[k] = v;
  }
  return out;
}

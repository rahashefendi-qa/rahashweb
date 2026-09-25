"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { normalizeLebanesePhone } from "@/lib/lebanon";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { notifySchema } from "@/lib/validation";

export type NotifyState = { ok: boolean; message: string } | null;

export async function requestStockNotification(_: NotifyState, formData: FormData): Promise<NotifyState> {
  const parsed = notifySchema.safeParse({ productId: formData.get("productId"), contact: formData.get("contact") });
  if (!parsed.success) return { ok: false, message: "Enter an email address or a Lebanese phone number." };

  if (!(await rateLimit(`notify:${await clientIp()}`, 10, 3600))) {
    return { ok: false, message: "Too many requests. Please try again later." };
  }

  const { productId, contact } = parsed.data;
  const isEmail = z.string().email().safeParse(contact).success;
  const phone = isEmail ? null : normalizeLebanesePhone(contact);
  if (!isEmail && !phone) return { ok: false, message: "Enter a valid email or Lebanese phone number." };

  const product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
  if (!product) return { ok: false, message: "Product not found." };

  const email = isEmail ? contact.toLowerCase() : null;
  const existing = await db.stockNotification.findFirst({
    where: { productId, notifiedAt: null, ...(email ? { email } : { phone }) },
  });
  if (!existing) await db.stockNotification.create({ data: { productId, email, phone } });

  return { ok: true, message: "You're on the list. We'll let you know when it's back." };
}

"use server";

import { after } from "next/server";
import { createOrder, OrderError, sendOrderEmails } from "@/lib/orders";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { checkoutSchema, type CheckoutInput } from "@/lib/validation";

export type CheckoutResult =
  | { ok: true; token: string; number: number }
  | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function placeOrder(input: CheckoutInput): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, message: "Please check the highlighted fields.", fieldErrors };
  }

  const ip = await clientIp();
  if (!(await rateLimit(`order:${ip}`, 6, 600))) {
    return { ok: false, message: "Too many orders from this connection. Please wait a few minutes or call us." };
  }

  try {
    const order = await createOrder(parsed.data);
    // Emails are sent after the response so the customer isn't kept waiting.
    // Delivery success/failure is recorded on the order and visible in the dashboard.
    after(() => sendOrderEmails(order.id).catch((e) => console.error("[order] email step failed", e)));
    return { ok: true, token: order.publicToken, number: order.number };
  } catch (err) {
    if (err instanceof OrderError) return { ok: false, message: err.message };
    console.error("[order] failed", err);
    return { ok: false, message: "We couldn't place your order. Please try again or contact us." };
  }
}

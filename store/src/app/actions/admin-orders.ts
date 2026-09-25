"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { changeOrderStatus, OrderError, ORDER_STATUSES } from "@/lib/orders";

export type ActionResult = { ok: boolean; message: string } | null;

const statusSchema = z.object({
  orderId: z.string().min(1).max(40),
  status: z.enum(ORDER_STATUSES as [string, ...string[]]),
  note: z.string().trim().max(500).optional(),
});

export async function updateOrderStatus(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  const parsed = statusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Invalid status." };
  try {
    await changeOrderStatus(parsed.data.orderId, parsed.data.status as never, admin.email, parsed.data.note);
  } catch (e) {
    if (e instanceof OrderError) return { ok: false, message: e.message };
    console.error(e);
    return { ok: false, message: "Could not update the order. Please try again." };
  }
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout"); // stock may have changed
  return { ok: true, message: "Status updated." };
}

const notesSchema = z.object({
  orderId: z.string().min(1).max(40),
  internalNotes: z.string().trim().max(3000),
  paymentReference: z.string().trim().max(120).optional(),
});

export async function updateOrderNotes(_: ActionResult, formData: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = notesSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, message: "Notes are too long." };
  await db.order.update({
    where: { id: parsed.data.orderId },
    data: {
      internalNotes: parsed.data.internalNotes || null,
      ...(parsed.data.paymentReference !== undefined ? { paymentReference: parsed.data.paymentReference || null } : {}),
    },
  });
  revalidatePath(`/admin/orders/${parsed.data.orderId}`);
  return { ok: true, message: "Saved." };
}

export async function resendOrderEmail(orderId: string): Promise<ActionResult> {
  await requireAdmin();
  const { sendOrderEmails } = await import("@/lib/orders");
  await sendOrderEmails(orderId);
  const o = await db.order.findUnique({ where: { id: orderId }, select: { adminEmailError: true, adminEmailSentAt: true } });
  revalidatePath(`/admin/orders/${orderId}`);
  return o?.adminEmailError ? { ok: false, message: o.adminEmailError } : { ok: true, message: "Email sent." };
}

"use client";

import { useActionState, useState, useTransition } from "react";
import type { OrderStatus } from "@prisma/client";
import { resendOrderEmail, updateOrderNotes, updateOrderStatus, type ActionResult } from "@/app/actions/admin-orders";
import { Button, Spinner } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { STATUS_LABEL } from "./ui";

const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];

export function Feedback({ state }: { state: ActionResult }) {
  if (!state) return null;
  return <p role="status" className={cn("text-xs", state.ok ? "text-success" : "text-danger")}>{state.message}</p>;
}

export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(updateOrderStatus, null);
  const [selected, setSelected] = useState<OrderStatus>(status);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <div className="grid grid-cols-2 gap-2">
        {FLOW.map((s) => (
          <label
            key={s}
            className={cn(
              "flex cursor-pointer items-center justify-center border px-2 py-2 text-xs transition",
              selected === s ? "border-paper bg-paper text-ink" : "border-line text-stone hover:text-paper",
              s === "CANCELLED" && selected !== s && "hover:border-danger/50",
            )}
          >
            <input type="radio" name="status" value={s} checked={selected === s} onChange={() => setSelected(s)} className="sr-only" />
            {STATUS_LABEL[s]}
          </label>
        ))}
      </div>
      <input name="note" placeholder="Note (optional) — e.g. confirmed by phone" className="field text-sm" maxLength={500} />
      <Button type="submit" size="sm" className="w-full" disabled={pending || selected === status}>
        {pending ? <Spinner /> : "Update status"}
      </Button>
      <Feedback state={state} />
    </form>
  );
}

export function OrderNotesForm({ orderId, notes, paymentReference, showReference }: { orderId: string; notes: string; paymentReference: string; showReference: boolean }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(updateOrderNotes, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      {showReference && (
        <label className="block">
          <span className="mb-1.5 block text-xs text-stone">Wish Money reference</span>
          <input name="paymentReference" defaultValue={paymentReference} className="field text-sm" maxLength={120} />
        </label>
      )}
      <textarea name="internalNotes" defaultValue={notes} rows={4} placeholder="Only visible to admins" className="field text-sm" maxLength={3000} />
      <div className="flex items-center gap-4">
        <Button type="submit" size="sm" variant="outline" disabled={pending}>{pending ? <Spinner /> : "Save notes"}</Button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function ResendEmailButton({ orderId }: { orderId: string }) {
  const [pending, start] = useTransition();
  const [state, setState] = useState<ActionResult>(null);
  return (
    <div className="mt-4 space-y-2">
      <Button size="sm" variant="outline" disabled={pending} onClick={() => start(async () => setState(await resendOrderEmail(orderId)))}>
        {pending ? <Spinner /> : "Resend order emails"}
      </Button>
      <Feedback state={state} />
    </div>
  );
}

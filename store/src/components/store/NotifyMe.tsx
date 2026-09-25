"use client";

import { useActionState } from "react";
import { requestStockNotification, type NotifyState } from "@/app/actions/notify";
import { Button, Spinner } from "@/components/ui/Button";

export function NotifyMe({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState<NotifyState, FormData>(requestStockNotification, null);

  if (state?.ok) {
    return <p className="border border-line bg-graphite p-4 text-sm text-brass-soft">{state.message}</p>;
  }

  return (
    <form action={action} className="space-y-3">
      <p className="text-sm text-stone">This piece is sold out. Leave your email or phone and we&apos;ll tell you when it returns.</p>
      <input type="hidden" name="productId" value={productId} />
      <div className="flex gap-2">
        <input
          name="contact"
          required
          maxLength={160}
          placeholder="Email or phone number"
          className="field h-12 flex-1"
          aria-label="Email or phone number"
        />
        <Button type="submit" disabled={pending} variant="outline">
          {pending ? <Spinner /> : "Notify me"}
        </Button>
      </div>
      {state && !state.ok && <p className="text-xs text-danger">{state.message}</p>}
    </form>
  );
}

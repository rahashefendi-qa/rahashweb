"use client";

import { useActionState } from "react";
import { changePassword, type AuthState } from "@/app/actions/auth";
import { Button, Spinner } from "@/components/ui/Button";

export function PasswordForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(changePassword, null);
  return (
    <form action={action} className="space-y-3">
      <input name="current" type="password" autoComplete="current-password" placeholder="Current password" className="field" required />
      <input name="next" type="password" autoComplete="new-password" placeholder="New password (min 10 characters)" className="field" required minLength={10} />
      <input name="confirm" type="password" autoComplete="new-password" placeholder="Confirm new password" className="field" required />
      <Button type="submit" size="sm" disabled={pending}>{pending ? <Spinner /> : "Update password"}</Button>
      {state?.error && <p className="text-xs text-danger">{state.error}</p>}
      {state?.success && <p className="text-xs text-success">{state.success}</p>}
    </form>
  );
}

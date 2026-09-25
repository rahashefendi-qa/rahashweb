"use client";

import { useActionState } from "react";
import { login, type AuthState } from "@/app/actions/auth";
import { Button, Spinner } from "@/components/ui/Button";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, null);
  return (
    <form action={action} className="mt-10 space-y-5">
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-stone">Email</span>
        <input name="email" type="email" autoComplete="username" required className="field" defaultValue={state?.email} key={state?.email} />
      </label>
      <label className="block">
        <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-stone">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="field" />
      </label>
      {state?.error && <p role="alert" className="text-sm text-danger">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? <Spinner /> : "Sign in"}
      </Button>
    </form>
  );
}

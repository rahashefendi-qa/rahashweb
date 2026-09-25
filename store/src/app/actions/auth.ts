"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { authenticate, clearSessionCookie, createSessionCookie, getAdmin, hashPassword, verifyPassword } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export type AuthState = { error?: string; success?: string; email?: string } | null;

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  password: z.string().min(1).max(200),
});

export async function login(_: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  const email = String(formData.get("email") ?? "").slice(0, 160);
  if (!parsed.success) return { error: "Enter your email and password.", email };

  const ip = await clientIp();
  // Limit by IP and by account to slow down password guessing.
  const [ipOk, accountOk] = await Promise.all([
    rateLimit(`login:ip:${ip}`, 10, 900),
    rateLimit(`login:acct:${parsed.data.email}`, 8, 900),
  ]);
  if (!ipOk || !accountOk) return { error: "Too many attempts. Please wait 15 minutes and try again.", email };

  const user = await authenticate(parsed.data.email, parsed.data.password);
  if (!user) return { error: "Incorrect email or password.", email };

  await createSessionCookie(user);
  redirect("/admin");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/admin/login");
}

const passwordSchema = z
  .object({
    current: z.string().min(1).max(200),
    next: z.string().min(10, "New password must be at least 10 characters.").max(200),
    confirm: z.string(),
  })
  .refine((v) => v.next === v.confirm, { message: "Passwords do not match.", path: ["confirm"] });

export async function changePassword(_: AuthState, formData: FormData): Promise<AuthState> {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  const parsed = passwordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const user = await db.adminUser.findUniqueOrThrow({ where: { id: admin.id } });
  if (!(await verifyPassword(parsed.data.current, user.passwordHash))) return { error: "Current password is incorrect." };

  // Bumping sessionVersion signs out every other device.
  const updated = await db.adminUser.update({
    where: { id: admin.id },
    data: { passwordHash: await hashPassword(parsed.data.next), sessionVersion: { increment: 1 } },
  });
  await createSessionCookie(updated);
  return { success: "Password updated. Other devices have been signed out." };
}

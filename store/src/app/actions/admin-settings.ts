"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { settingsSchema } from "@/lib/validation";

export type SettingsResult = { ok: true } | { ok: false; message: string; fieldErrors?: Record<string, string> };

export async function saveSettings(input: z.input<typeof settingsSchema>): Promise<SettingsResult> {
  await requireAdmin();
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const i of parsed.error.issues) fieldErrors[String(i.path[0])] ??= i.message;
    return { ok: false, message: "Please fix the highlighted fields.", fieldErrors };
  }
  const data = parsed.data;
  if (!data.codEnabled && !(data.wishMoneyEnabled && data.wishMoneyNumber)) {
    return { ok: false, message: "Enable at least one payment method (Wish Money needs a number)." };
  }

  await db.settings.upsert({ where: { id: 1 }, update: data, create: { id: 1, ...data } });
  revalidatePath("/", "layout");
  return { ok: true };
}

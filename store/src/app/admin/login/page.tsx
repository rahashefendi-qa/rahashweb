import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/auth/admin";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const settings = await getSettings();
  return (
    <div className="grid min-h-dvh place-items-center bg-ink px-5">
      <div className="w-full max-w-sm">
        <p className="display text-center text-3xl tracking-[0.3em]">{settings.storeName}</p>
        <p className="eyebrow mt-3 text-center text-ash">Admin</p>
        <LoginForm />
      </div>
    </div>
  );
}

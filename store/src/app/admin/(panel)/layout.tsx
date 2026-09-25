import type { Metadata } from "next";
import { AdminNav } from "@/components/admin/AdminNav";
import { requireAdmin } from "@/lib/auth/admin";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [settings, pending] = await Promise.all([getSettings(), db.order.count({ where: { status: "PENDING" } })]);

  return (
    <div className="min-h-dvh bg-ink lg:grid lg:grid-cols-[240px_1fr]">
      <AdminNav storeName={settings.storeName} email={admin.email} pendingOrders={pending} />
      <main className="min-w-0 px-4 pb-24 pt-6 md:px-8 lg:px-12 lg:pt-10">{children}</main>
    </div>
  );
}

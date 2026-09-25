import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { Card, EmptyState, PageHeader, Stat, StatusBadge, td, th } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { emailProvider } from "@/lib/email/send";
import { formatPrice } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { storageMode } from "@/lib/storage";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const [settings, totalOrders, pending, delivered, sales, sales30, products, soldOut, recent] = await Promise.all([
    getSettings(),
    db.order.count(),
    db.order.count({ where: { status: "PENDING" } }),
    db.order.count({ where: { status: "DELIVERED" } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" }, createdAt: { gte: since } } }),
    db.product.count(),
    db.product.count({ where: { OR: [{ stock: 0 }, { soldOut: true }] } }),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { _count: { select: { items: true } } } }),
  ]);

  const warnings: { text: string; href?: string }[] = [];
  if (!emailProvider() || !process.env.EMAIL_FROM) warnings.push({ text: "Email is not configured — order alerts cannot be sent. Set RESEND_API_KEY (or SMTP_*) and EMAIL_FROM." });
  if (!settings.adminEmail && !process.env.ADMIN_EMAIL) warnings.push({ text: "No admin email set for new-order alerts.", href: "/admin/settings" });
  if (settings.wishMoneyEnabled && !settings.wishMoneyNumber) warnings.push({ text: "Wish Money is enabled but no number is set — it is hidden at checkout.", href: "/admin/settings" });
  if (storageMode() === "unconfigured") warnings.push({ text: "Image storage is not configured — set the CLOUDINARY_* variables or connect a Vercel Blob store to upload product photos." });

  return (
    <>
      <AutoRefresh seconds={30} />
      <PageHeader title="Dashboard" description={`Welcome back. Here's what's happening at ${settings.storeName}.`} actions={<ButtonLink href="/admin/products/new" size="sm">Add product</ButtonLink>} />

      {warnings.length > 0 && (
        <div className="mb-8 space-y-2">
          {warnings.map((w) => (
            <div key={w.text} className="flex items-start gap-3 border border-brass/40 bg-brass/10 p-4 text-sm text-brass-soft">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <span className="flex-1">{w.text}</span>
              {w.href && <Link href={w.href} className="underline underline-offset-4">Fix</Link>}
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:gap-4 xl:grid-cols-4">
        <Stat label="Total orders" value={totalOrders} href="/admin/orders" />
        <Stat label="Pending orders" value={pending} href="/admin/orders?status=PENDING" tone={pending ? "warn" : undefined} />
        <Stat label="Completed orders" value={delivered} href="/admin/orders?status=DELIVERED" tone="ok" />
        <Stat label="Total sales" value={formatPrice(sales._sum.total ?? 0, settings.currency)} />
        <Stat label="Sales · last 30 days" value={formatPrice(sales30._sum.total ?? 0, settings.currency)} />
        <Stat label="Products" value={products} href="/admin/products" />
        <Stat label="Sold-out products" value={soldOut} href="/admin/products?filter=sold-out" tone={soldOut ? "warn" : undefined} />
        <Stat label="Delivery fee" value={formatPrice(settings.deliveryFee, settings.currency)} href="/admin/settings" />
      </div>

      <Card title="Recent orders" className="mt-8" actions={<Link href="/admin/orders" className="text-xs text-stone hover:text-paper">View all →</Link>}>
        {recent.length === 0 ? (
          <EmptyState title="No orders yet" text="New orders will appear here automatically." />
        ) : (
          <div className="-m-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="border-b border-line">
                <tr><th className={th}>Order</th><th className={th}>Customer</th><th className={th}>Date</th><th className={th}>Payment</th><th className={th}>Status</th><th className={`${th} text-right`}>Total</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.map((o) => (
                  <tr key={o.id} className="transition hover:bg-graphite">
                    <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brass-soft">#{o.number}</Link></td>
                    <td className={td}>{o.customerName}<div className="text-xs text-ash">{o.city}</div></td>
                    <td className={`${td} text-stone`}>{formatDate(o.createdAt)}</td>
                    <td className={`${td} text-stone`}>{o.paymentMethod === "COD" ? "Cash" : "Wish Money"}</td>
                    <td className={td}><StatusBadge status={o.status} /></td>
                    <td className={`${td} text-right tabular-nums`}>{formatPrice(o.total, o.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}

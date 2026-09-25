import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { EmptyState, PageHeader, td, th } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Customers" };

export default async function CustomersPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const q = (await searchParams).q?.trim().slice(0, 80) ?? "";
  const where: Prisma.CustomerWhereInput = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" } }, { phone: { contains: q.replace(/[^\d]/g, "") || q } }, { email: { contains: q, mode: "insensitive" } }] }
    : {};
  const [customers, settings] = await Promise.all([
    db.customer.findMany({ where, orderBy: { updatedAt: "desc" }, take: 200, include: { orders: { select: { total: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } } } }),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader title="Customers" description="Created automatically from orders (matched by phone number)." />
      <form className="mb-6" role="search"><input name="q" defaultValue={q} placeholder="Search name, phone or email…" className="field" aria-label="Search customers" /></form>
      {customers.length === 0 ? (
        <EmptyState title="No customers yet" />
      ) : (
        <div className="overflow-x-auto border border-line bg-coal">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-line"><tr><th className={th}>Customer</th><th className={th}>Phone</th><th className={th}>Orders</th><th className={th}>Spent</th><th className={th}>Last order</th></tr></thead>
            <tbody className="divide-y divide-line">
              {customers.map((c) => {
                const spent = c.orders.filter((o) => o.status !== "CANCELLED").reduce((s, o) => s + o.total, 0);
                return (
                  <tr key={c.id} className="hover:bg-graphite">
                    <td className={td}>{c.name}{c.email && <div className="text-xs text-ash">{c.email}</div>}</td>
                    <td className={td}><Link href={`/admin/orders?q=${encodeURIComponent(c.phone)}`} className="hover:text-brass-soft">{c.phone}</Link></td>
                    <td className={td}>{c.orders.length}</td>
                    <td className={`${td} tabular-nums`}>{formatPrice(spent, settings.currency)}</td>
                    <td className={`${td} text-stone`}>{c.orders[0] ? formatDate(c.orders[0].createdAt, false) : "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

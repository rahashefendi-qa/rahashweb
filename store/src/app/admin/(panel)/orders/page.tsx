import Link from "next/link";
import type { OrderStatus, Prisma } from "@prisma/client";
import { AutoRefresh } from "@/components/admin/AutoRefresh";
import { OrderFilters } from "@/components/admin/OrderFilters";
import { EmptyState, PageHeader, StatusBadge, td, th } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { ORDER_STATUSES } from "@/lib/orders";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Orders" };

const PAGE_SIZE = 25;

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function OrdersPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) ?? "";
  const status = ORDER_STATUSES.includes(sp.status as OrderStatus) ? (sp.status as OrderStatus) : undefined;
  const payment = sp.payment === "COD" || sp.payment === "WISH_MONEY" ? sp.payment : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const where: Prisma.OrderWhereInput = {
    ...(status ? { status } : {}),
    ...(payment ? { paymentMethod: payment } : {}),
  };
  if (q) {
    const num = Number(q.replace(/^#/, ""));
    const digits = q.replace(/[^\d]/g, "");
    where.OR = [
      ...(Number.isInteger(num) && num > 0 && num < 2_000_000_000 ? [{ number: num }] : []),
      { customerName: { contains: q, mode: "insensitive" } },
      ...(digits.length >= 3 ? [{ customerPhone: { contains: digits } }] : []),
      { customerEmail: { contains: q, mode: "insensitive" } },
      { city: { contains: q, mode: "insensitive" } },
    ];
  }

  const [orders, total, counts] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { _count: { select: { items: true } } },
    }),
    db.order.count({ where }),
    db.order.groupBy({ by: ["status"], _count: true }),
  ]);
  const countBy = Object.fromEntries(counts.map((c) => [c.status, c._count])) as Record<string, number>;
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const qs = (p: number) => {
    const u = new URLSearchParams(Object.entries({ ...sp, page: String(p) }).filter(([, v]) => v) as [string, string][]);
    return `?${u}`;
  };

  return (
    <>
      <AutoRefresh seconds={30} />
      <PageHeader title="Orders" description={`${total} order${total === 1 ? "" : "s"}${status ? ` · ${status.toLowerCase()}` : ""}`} />
      <OrderFilters counts={countBy} />

      {orders.length === 0 ? (
        <EmptyState title="No orders found" text={q || status ? "Try a different search or filter." : "New orders will appear here automatically."} />
      ) : (
        <>
          {/* Mobile cards */}
          <ul className="space-y-2 md:hidden">
            {orders.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="block border border-line bg-coal p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">#{o.number}</span>
                    <StatusBadge status={o.status} />
                  </div>
                  <div className="mt-2 flex items-end justify-between text-sm">
                    <div>
                      <p>{o.customerName}</p>
                      <p className="text-xs text-ash">{o.customerPhone} · {o.city}</p>
                      <p className="text-xs text-ash">{formatDate(o.createdAt)}</p>
                    </div>
                    <span className="tabular-nums">{formatPrice(o.total, o.currency)}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto border border-line bg-coal md:block">
            <table className="w-full text-sm">
              <thead className="border-b border-line">
                <tr>
                  <th className={th}>Order</th><th className={th}>Date</th><th className={th}>Customer</th><th className={th}>Location</th>
                  <th className={th}>Items</th><th className={th}>Payment</th><th className={th}>Status</th><th className={`${th} text-right`}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="transition hover:bg-graphite">
                    <td className={td}><Link href={`/admin/orders/${o.id}`} className="font-medium hover:text-brass-soft">#{o.number}</Link></td>
                    <td className={`${td} whitespace-nowrap text-stone`}>{formatDate(o.createdAt)}</td>
                    <td className={td}>{o.customerName}<div className="text-xs text-ash">{o.customerPhone}</div></td>
                    <td className={`${td} text-stone`}>{o.city}<div className="text-xs text-ash">{o.governorate}</div></td>
                    <td className={`${td} text-stone`}>{o._count.items}</td>
                    <td className={`${td} text-stone`}>{o.paymentMethod === "COD" ? "Cash" : "Wish Money"}</td>
                    <td className={td}><StatusBadge status={o.status} /></td>
                    <td className={`${td} text-right tabular-nums`}>{formatPrice(o.total, o.currency)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pages > 1 && (
            <nav className="mt-6 flex items-center justify-between text-sm text-stone" aria-label="Pagination">
              {page > 1 ? <Link href={qs(page - 1)} className="hover:text-paper">← Previous</Link> : <span />}
              <span>Page {page} of {pages}</span>
              {page < pages ? <Link href={qs(page + 1)} className="hover:text-paper">Next →</Link> : <span />}
            </nav>
          )}
        </>
      )}
    </>
  );
}

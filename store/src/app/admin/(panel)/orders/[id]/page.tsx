import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessageCircle, Phone } from "lucide-react";
import { OrderNotesForm, OrderStatusForm, ResendEmailButton } from "@/components/admin/OrderForms";
import { Card, PageHeader, StatusBadge, STATUS_LABEL } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Order" };

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      history: { orderBy: { createdAt: "desc" } },
      customer: { include: { _count: { select: { orders: true } } } },
    },
  });
  if (!order) notFound();

  const wa = order.customerPhone.replace(/[^\d]/g, "");
  const money = (c: number) => formatPrice(c, order.currency);

  return (
    <>
      <Link href="/admin/orders" className="text-xs text-stone hover:text-paper">← All orders</Link>
      <PageHeader
        title={`Order #${order.number}`}
        description={`Placed ${formatDate(order.createdAt)}`}
        actions={<StatusBadge status={order.status} />}
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          <Card title="Items">
            <ul className="divide-y divide-line">
              {order.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3 first:pt-0">
                  <div className="relative aspect-[4/5] w-12 shrink-0 bg-bone">
                    {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1 text-sm">
                    {i.productId ? <Link href={`/admin/products/${i.productId}`} className="hover:text-brass-soft">{i.productName}</Link> : i.productName}
                    <div className="text-xs text-ash">{money(i.unitPrice)} × {i.quantity}</div>
                  </div>
                  <span className="text-sm tabular-nums">{money(i.lineTotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{money(order.subtotal)}</dd></div>
              <div className="flex justify-between"><dt className="text-stone">Delivery ({order.governorate})</dt><dd className="tabular-nums">{money(order.deliveryFee)}</dd></div>
              <div className="flex justify-between text-base"><dt>Total</dt><dd className="tabular-nums">{money(order.total)}</dd></div>
            </dl>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card title="Customer">
              <p className="text-base">{order.customerName}</p>
              <p className="mt-1 text-sm text-stone">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-sm text-stone">{order.customerEmail}</p>}
              <p className="mt-2 text-xs text-ash">{order.customer._count.orders} order{order.customer._count.orders === 1 ? "" : "s"} from this customer</p>
              <div className="mt-4 flex gap-2">
                <a href={`tel:${order.customerPhone}`} className="flex items-center gap-2 border border-line px-3 py-2 text-xs hover:border-stone"><Phone size={13} /> Call</a>
                <a href={`https://wa.me/${wa}?text=${encodeURIComponent(`Hello ${order.customerName}, regarding your order #${order.number}`)}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 border border-line px-3 py-2 text-xs hover:border-stone"><MessageCircle size={13} /> WhatsApp</a>
              </div>
            </Card>
            <Card title="Delivery address">
              <address className="space-y-0.5 text-sm not-italic text-stone">
                <p className="text-paper">{order.address}</p>
                {order.building && <p>{order.building}</p>}
                <p>{order.area}, {order.city}</p>
                <p>{order.governorate}, Lebanon</p>
              </address>
              {order.customerNotes && (
                <div className="mt-4 border-t border-line pt-3">
                  <p className="eyebrow text-ash">Customer notes</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm">{order.customerNotes}</p>
                </div>
              )}
            </Card>
          </div>

          <Card title="Internal notes">
            <OrderNotesForm orderId={order.id} notes={order.internalNotes ?? ""} paymentReference={order.paymentReference ?? ""} showReference={order.paymentMethod === "WISH_MONEY"} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Status">
            <OrderStatusForm orderId={order.id} status={order.status} />
            <p className="mt-3 text-xs text-ash">
              Stock is deducted when an order is first confirmed{order.stockDeducted ? " (already deducted for this order)" : ""} and restored if a confirmed order is cancelled.
            </p>
          </Card>

          <Card title="Payment">
            <p className="text-sm">{order.paymentMethod === "COD" ? "Cash on Delivery" : "Wish Money"}</p>
            {order.paymentMethod === "WISH_MONEY" && (
              <p className="mt-1 text-xs text-stone">Reference: {order.paymentReference || <span className="text-brass-soft">not provided yet</span>}</p>
            )}
          </Card>

          <Card title="Notifications">
            <p className="text-sm">
              Admin email:{" "}
              {order.adminEmailSentAt ? <span className="text-success">sent {formatDate(order.adminEmailSentAt)}</span> : order.adminEmailError ? <span className="text-danger">failed</span> : <span className="text-stone">pending</span>}
            </p>
            {order.adminEmailError && <p className="mt-1 text-xs text-danger">{order.adminEmailError}</p>}
            {order.customerEmail && (
              <p className="mt-1 text-sm">Customer email: {order.customerEmailSentAt ? <span className="text-success">sent</span> : <span className="text-stone">not sent</span>}</p>
            )}
            <ResendEmailButton orderId={order.id} />
          </Card>

          <Card title="History">
            <ol className="space-y-3 text-sm">
              {order.history.map((h) => (
                <li key={h.id} className="border-l border-line pl-3">
                  <p>{h.from ? `${STATUS_LABEL[h.from]} → ` : ""}{STATUS_LABEL[h.to]}</p>
                  <p className="text-xs text-ash">{formatDate(h.createdAt)}{h.byAdmin ? ` · ${h.byAdmin}` : ""}</p>
                  {h.note && <p className="mt-1 text-xs text-stone">{h.note}</p>}
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}

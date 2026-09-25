import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { z } from "zod";
import { OrderConfirmedAnimation } from "@/components/store/OrderConfirmedAnimation";
import { ButtonLink } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function OrderConfirmedPage({ params }: Props) {
  const { token } = await params;
  if (!z.string().regex(/^[A-Za-z0-9_-]{16,40}$/).safeParse(token).success) notFound();

  const [order, settings] = await Promise.all([
    db.order.findUnique({ where: { publicToken: token }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) notFound();

  return (
    <div className="container-x max-w-3xl pt-32 text-center md:pt-44">
      <OrderConfirmedAnimation />
      <h1 className="display mt-8 text-[clamp(3rem,9vw,6rem)]">Order Confirmed</h1>
      <p className="eyebrow mt-6 text-stone">Order number</p>
      <p className="display mt-2 text-5xl text-brass-soft">#{order.number}</p>
      <p className="mx-auto mt-8 max-w-md text-lg leading-relaxed">Thank you for your order.</p>
      <p className="mx-auto mt-2 max-w-md text-stone">We will contact you shortly to confirm your order.</p>

      {order.paymentMethod === "WISH_MONEY" && settings.wishMoneyNumber && (
        <div className="mx-auto mt-10 max-w-md border border-brass/40 bg-coal p-6 text-left text-sm">
          <p className="eyebrow text-brass-soft">Wish Money payment</p>
          <p className="mt-3 text-stone">
            {order.paymentReference
              ? "We received your transfer reference and will verify the payment."
              : `Please send ${formatPrice(order.total, order.currency)} to the number below and share the transfer reference with us.`}
          </p>
          <p className="mt-4 text-lg tabular-nums">{settings.wishMoneyNumber}</p>
          {settings.wishMoneyName && <p className="text-stone">{settings.wishMoneyName}</p>}
          <p className="mt-2 text-xs text-ash">Mention order #{order.number} in the transfer note.</p>
        </div>
      )}

      <div className="mx-auto mt-12 max-w-md border-y border-line py-6 text-left">
        <ul className="space-y-4">
          {order.items.map((i) => (
            <li key={i.id} className="flex items-center gap-4">
              <div className="relative aspect-[4/5] w-12 shrink-0 bg-bone">
                {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
              </div>
              <span className="flex-1 text-sm">{i.quantity} × {i.productName}</span>
              <span className="text-sm tabular-nums">{formatPrice(i.lineTotal, order.currency)}</span>
            </li>
          ))}
        </ul>
        <dl className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd>{formatPrice(order.subtotal, order.currency)}</dd></div>
          <div className="flex justify-between"><dt className="text-stone">Delivery</dt><dd>{order.deliveryFee === 0 ? "Free" : formatPrice(order.deliveryFee, order.currency)}</dd></div>
          <div className="flex justify-between text-base"><dt>Total</dt><dd>{formatPrice(order.total, order.currency)}</dd></div>
          <div className="flex justify-between pt-2 text-xs text-ash"><dt>Payment</dt><dd>{order.paymentMethod === "COD" ? "Cash on Delivery" : "Wish Money"}</dd></div>
          <div className="flex justify-between text-xs text-ash"><dt>Delivering to</dt><dd className="text-right">{order.area}, {order.city}</dd></div>
        </dl>
      </div>

      <ButtonLink href="/shop" size="lg" className="mt-12">Continue Shopping</ButtonLink>
    </div>
  );
}

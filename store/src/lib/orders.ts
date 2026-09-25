import "server-only";
import { randomBytes } from "crypto";
import { Prisma, type OrderStatus } from "@prisma/client";
import { db } from "./db";
import { computeDeliveryFee } from "./delivery";
import { adminOrderEmail, customerOrderEmail } from "./email/templates";
import { sendEmail } from "./email/send";
import { effectivePrice, isAvailable } from "./products";
import { getSettings, parseGovernorateFees } from "./settings";
import type { checkoutSchema } from "./validation";
import type { z } from "zod";

export class OrderError extends Error {}

export const ORDER_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"];

/** Statuses at which the ordered quantities have left the inventory. */
const STOCK_HOLDING: OrderStatus[] = ["CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED"];

type CheckoutData = z.output<typeof checkoutSchema>;

/**
 * Create an order. Prices, availability and delivery fee are always
 * recalculated on the server — nothing from the browser is trusted.
 */
export async function createOrder(input: CheckoutData) {
  const settings = await getSettings();
  if (input.paymentMethod === "COD" && !settings.codEnabled) throw new OrderError("Cash on Delivery is currently unavailable.");
  if (input.paymentMethod === "WISH_MONEY" && !(settings.wishMoneyEnabled && settings.wishMoneyNumber)) {
    throw new OrderError("Wish Money is currently unavailable.");
  }

  // Merge duplicate lines
  const quantities = new Map<string, number>();
  for (const item of input.items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);

  const products = await db.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
    include: { images: { orderBy: { position: "asc" }, take: 1 } },
  });

  const lines = [...quantities.entries()].map(([productId, quantity]) => {
    const p = products.find((x) => x.id === productId);
    if (!p || !p.active) throw new OrderError("One of the products in your cart is no longer available.");
    if (!isAvailable(p)) throw new OrderError(`${p.name} is sold out.`);
    if (quantity > p.stock) throw new OrderError(`Only ${p.stock} × ${p.name} left in stock.`);
    const unitPrice = effectivePrice(p);
    return {
      productId: p.id,
      productName: p.name,
      productSlug: p.slug,
      imageUrl: p.images[0]?.url ?? null,
      unitPrice,
      quantity,
      lineTotal: unitPrice * quantity,
    };
  });

  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);
  const deliveryFee = computeDeliveryFee(
    {
      deliveryFee: settings.deliveryFee,
      governorateFees: parseGovernorateFees(settings.governorateFees),
      freeDeliveryOver: settings.freeDeliveryOver,
    },
    subtotal,
    input.governorate,
  );

  const order = await db.$transaction(async (tx) => {
    const customer = await tx.customer.upsert({
      where: { phone: input.phone },
      update: { name: input.fullName, ...(input.email ? { email: input.email } : {}) },
      create: { name: input.fullName, phone: input.phone, email: input.email },
    });
    return tx.order.create({
      data: {
        publicToken: randomBytes(18).toString("base64url"),
        customerId: customer.id,
        customerName: input.fullName,
        customerPhone: input.phone,
        customerEmail: input.email,
        governorate: input.governorate,
        city: input.city,
        area: input.area,
        address: input.address,
        building: input.building,
        customerNotes: input.notes,
        paymentMethod: input.paymentMethod,
        paymentReference: input.paymentMethod === "WISH_MONEY" ? input.paymentReference : null,
        subtotal,
        deliveryFee,
        total: subtotal + deliveryFee,
        currency: settings.currency,
        items: { create: lines },
        history: { create: { to: "PENDING", note: "Order placed on website" } },
      },
      include: { items: true },
    });
  });

  return order;
}

/** Sends the admin alert and (optional) customer confirmation, recording the outcome on the order. */
export async function sendOrderEmails(orderId: string) {
  const [order, settings] = await Promise.all([
    db.order.findUnique({ where: { id: orderId }, include: { items: true } }),
    getSettings(),
  ]);
  if (!order) return;

  const adminTo = settings.adminEmail || process.env.ADMIN_EMAIL;
  if (adminTo) {
    const msg = adminOrderEmail(order, settings.storeName);
    const res = await sendEmail({ to: adminTo, ...msg, replyTo: order.customerEmail });
    await db.order.update({
      where: { id: order.id },
      data: res.ok ? { adminEmailSentAt: new Date(), adminEmailError: null } : { adminEmailError: res.error.slice(0, 500) },
    });
  } else {
    await db.order.update({
      where: { id: order.id },
      data: { adminEmailError: "No admin email configured (Settings → Admin email)." },
    });
  }

  if (order.customerEmail) {
    const msg = customerOrderEmail(order, settings);
    const res = await sendEmail({ to: order.customerEmail, ...msg, replyTo: settings.storeEmail });
    if (res.ok) await db.order.update({ where: { id: order.id }, data: { customerEmailSentAt: new Date() } });
  }
}

/**
 * Change an order's status. Stock is deducted when an order first moves into
 * a confirmed state and restored if a confirmed order is cancelled.
 * Deduction is atomic: it fails if any product no longer has enough stock.
 */
export async function changeOrderStatus(orderId: string, to: OrderStatus, adminEmail: string, note?: string | null) {
  return db.$transaction(
    async (tx) => {
      const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true } });
      if (!order) throw new OrderError("Order not found.");
      if (order.status === to) return order;

      let stockDeducted = order.stockDeducted;

      if (STOCK_HOLDING.includes(to) && !order.stockDeducted) {
        for (const item of order.items) {
          if (!item.productId) continue;
          const updated = await tx.product.updateMany({
            where: { id: item.productId, stock: { gte: item.quantity } },
            data: { stock: { decrement: item.quantity } },
          });
          if (updated.count === 0) {
            throw new OrderError(`Not enough stock for "${item.productName}" to confirm this order. Update inventory first.`);
          }
        }
        stockDeducted = true;
      }

      if (to === "CANCELLED" && order.stockDeducted) {
        for (const item of order.items) {
          if (!item.productId) continue;
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
        stockDeducted = false;
      }

      return tx.order.update({
        where: { id: orderId },
        data: {
          status: to,
          stockDeducted,
          history: { create: { from: order.status, to, note: note || null, byAdmin: adminEmail } },
        },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
  );
}

import type { Order, OrderItem } from "@prisma/client";
import { formatPrice } from "../money";
import { formatDate, siteUrl } from "../utils";

type OrderWithItems = Order & { items: OrderItem[] };

const esc = (s: string | null | undefined) =>
  (s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const paymentLabel = (m: Order["paymentMethod"]) => (m === "COD" ? "Cash on Delivery" : "Wish Money");

function location(o: Order) {
  return `${o.area}, ${o.city}, ${o.governorate}`;
}

function shell(storeName: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f2eee8;font-family:Helvetica,Arial,sans-serif;color:#141412">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff">
<tr><td style="background:#0e0e0d;color:#f2eee8;padding:22px 28px;font-size:14px;letter-spacing:4px;text-transform:uppercase">${esc(storeName)}</td></tr>
<tr><td style="padding:28px">${body}</td></tr>
</table></td></tr></table></body></html>`;
}

function itemsTable(o: OrderWithItems) {
  const rows = o.items
    .map(
      (i) => `<tr>
<td style="padding:8px 0;border-bottom:1px solid #eee">${esc(i.productName)}</td>
<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center">${i.quantity}</td>
<td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right">${formatPrice(i.unitPrice, o.currency)}</td></tr>`,
    )
    .join("");
  return `<table width="100%" cellpadding="0" cellspacing="0" style="font-size:14px">
<tr><th align="left" style="font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px">Product</th><th style="font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px">Qty</th><th align="right" style="font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px">Price</th></tr>
${rows}
<tr><td colspan="2" style="padding-top:12px">Subtotal</td><td align="right" style="padding-top:12px">${formatPrice(o.subtotal, o.currency)}</td></tr>
<tr><td colspan="2">Delivery</td><td align="right">${o.deliveryFee === 0 ? "Free" : formatPrice(o.deliveryFee, o.currency)}</td></tr>
<tr><td colspan="2" style="padding-top:6px;font-weight:bold">Total</td><td align="right" style="padding-top:6px;font-weight:bold">${formatPrice(o.total, o.currency)}</td></tr>
</table>`;
}

export function adminOrderEmail(o: OrderWithItems, storeName: string) {
  const subject = `NEW ORDER #${o.number} — ${o.customerName} — ${formatPrice(o.total, o.currency)}`;
  const text = [
    `NEW ORDER #${o.number}`,
    formatDate(o.createdAt),
    "",
    "Customer:",
    `Name: ${o.customerName}`,
    `Phone: ${o.customerPhone}`,
    o.customerEmail ? `Email: ${o.customerEmail}` : null,
    `Location: ${location(o)}`,
    `Address: ${o.address}`,
    o.building ? `Building/Floor/Apt: ${o.building}` : null,
    "",
    "Products:",
    ...o.items.map((i) => `${i.productName}\n  Quantity: ${i.quantity}\n  Price: ${formatPrice(i.unitPrice, o.currency)}`),
    "",
    "Payment:",
    paymentLabel(o.paymentMethod),
    o.paymentReference ? `Wish Money reference: ${o.paymentReference}` : null,
    "",
    `Subtotal: ${formatPrice(o.subtotal, o.currency)}`,
    `Delivery: ${formatPrice(o.deliveryFee, o.currency)}`,
    `Total: ${formatPrice(o.total, o.currency)}`,
    "",
    "Customer Notes:",
    o.customerNotes || "—",
    "",
    `Open in dashboard: ${siteUrl(`/admin/orders/${o.id}`)}`,
  ]
    .filter((l) => l !== null)
    .join("\n");

  const label = "font-size:11px;color:#777;text-transform:uppercase;letter-spacing:1px;margin:22px 0 6px";
  const html = shell(
    storeName,
    `<h1 style="margin:0 0 4px;font-size:22px;font-weight:normal">NEW ORDER #${o.number}</h1>
<div style="color:#777;font-size:13px">${esc(formatDate(o.createdAt))}</div>
<div style="${label}">Customer</div>
<div style="font-size:14px;line-height:1.7">
<b>Name:</b> ${esc(o.customerName)}<br><b>Phone:</b> <a href="tel:${esc(o.customerPhone)}">${esc(o.customerPhone)}</a><br>
${o.customerEmail ? `<b>Email:</b> ${esc(o.customerEmail)}<br>` : ""}
<b>Location:</b> ${esc(location(o))}<br><b>Address:</b> ${esc(o.address)}<br>
${o.building ? `<b>Building/Floor/Apt:</b> ${esc(o.building)}<br>` : ""}</div>
<div style="${label}">Products</div>${itemsTable(o)}
<div style="${label}">Payment</div>
<div style="font-size:14px">${paymentLabel(o.paymentMethod)}${o.paymentReference ? `<br><b>Reference:</b> ${esc(o.paymentReference)}` : ""}</div>
<div style="${label}">Customer Notes</div>
<div style="font-size:14px;white-space:pre-wrap">${esc(o.customerNotes) || "—"}</div>
<p style="margin-top:28px"><a href="${siteUrl(`/admin/orders/${o.id}`)}" style="background:#0e0e0d;color:#f2eee8;padding:12px 20px;text-decoration:none;font-size:13px;letter-spacing:1px">OPEN ORDER</a></p>`,
  );
  return { subject, text, html };
}

export function customerOrderEmail(
  o: OrderWithItems,
  s: { storeName: string; phone: string | null; wishMoneyNumber: string | null; wishMoneyName: string | null },
) {
  const subject = `${s.storeName} — Order #${o.number} received`;
  const wish =
    o.paymentMethod === "WISH_MONEY" && s.wishMoneyNumber
      ? `Wish Money: please send ${formatPrice(o.total, o.currency)} to ${s.wishMoneyNumber}${s.wishMoneyName ? ` (${s.wishMoneyName})` : ""} if you haven't already.`
      : null;
  const text = [
    `Thank you for your order, ${o.customerName}.`,
    `Order number: #${o.number}`,
    "We will contact you shortly to confirm your order.",
    "",
    ...o.items.map((i) => `${i.quantity} × ${i.productName} — ${formatPrice(i.lineTotal, o.currency)}`),
    `Subtotal: ${formatPrice(o.subtotal, o.currency)}`,
    `Delivery: ${formatPrice(o.deliveryFee, o.currency)}`,
    `Total: ${formatPrice(o.total, o.currency)}`,
    `Payment: ${paymentLabel(o.paymentMethod)}`,
    wish,
    "",
    `Delivering to: ${o.address}, ${location(o)}`,
    s.phone ? `Questions? Call us on ${s.phone}.` : null,
  ]
    .filter((l) => l !== null)
    .join("\n");
  const html = shell(
    s.storeName,
    `<h1 style="margin:0 0 6px;font-size:24px;font-weight:normal">Thank you for your order</h1>
<p style="margin:0 0 18px;font-size:14px;color:#555">Order <b>#${o.number}</b> — we will contact you shortly to confirm it.</p>
${itemsTable(o)}
<p style="font-size:14px;margin-top:18px"><b>Payment:</b> ${paymentLabel(o.paymentMethod)}</p>
${wish ? `<p style="font-size:14px;background:#f2eee8;padding:12px">${esc(wish)}</p>` : ""}
<p style="font-size:14px;color:#555"><b>Delivering to:</b> ${esc(o.address)}, ${esc(location(o))}</p>
${s.phone ? `<p style="font-size:13px;color:#777">Questions? Call us on ${esc(s.phone)}.</p>` : ""}`,
  );
  return { subject, text, html };
}

export function backInStockEmail(p: { name: string; slug: string }, storeName: string) {
  const url = siteUrl(`/product/${p.slug}`);
  return {
    subject: `${p.name} is back in stock — ${storeName}`,
    text: `Good news — ${p.name} is available again.\n\n${url}`,
    html: shell(
      storeName,
      `<h1 style="margin:0 0 10px;font-size:22px;font-weight:normal">${esc(p.name)} is back</h1>
<p style="font-size:14px;color:#555">You asked us to let you know. Quantities are limited.</p>
<p><a href="${url}" style="background:#0e0e0d;color:#f2eee8;padding:12px 20px;text-decoration:none;font-size:13px;letter-spacing:1px">VIEW PRODUCT</a></p>`,
    ),
  };
}

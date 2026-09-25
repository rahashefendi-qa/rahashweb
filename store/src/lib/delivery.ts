/** Shared by the browser (display) and the server (authoritative calculation). */
export function computeDeliveryFee(
  opts: { deliveryFee: number; governorateFees: Record<string, number>; freeDeliveryOver: number | null },
  subtotal: number,
  governorate?: string | null,
) {
  if (opts.freeDeliveryOver != null && opts.freeDeliveryOver > 0 && subtotal >= opts.freeDeliveryOver) return 0;
  if (governorate && opts.governorateFees[governorate] != null) return opts.governorateFees[governorate];
  return opts.deliveryFee;
}

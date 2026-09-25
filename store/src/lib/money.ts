/** All money is stored as integer cents. */
export function formatPrice(cents: number, currency = "USD") {
  const hasCents = cents % 100 !== 0;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: hasCents ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(hasCents ? 2 : 0)} ${currency}`;
  }
}

/** "12.50" → 1250. Returns NaN for invalid input. */
export function toCents(value: string | number) {
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return NaN;
  return Math.round(n * 100);
}

export function centsToInput(cents: number | null | undefined) {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(/\.00$/, "");
}

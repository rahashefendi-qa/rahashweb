import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";

export function Price({
  price,
  salePrice,
  currency = "USD",
  className,
}: {
  price: number;
  salePrice?: number | null;
  currency?: string;
  className?: string;
}) {
  const onSale = salePrice != null && salePrice < price;
  return (
    <span className={cn("inline-flex items-baseline gap-2 tabular-nums", className)}>
      <span>{formatPrice(onSale ? salePrice! : price, currency)}</span>
      {onSale && <s className="text-[0.85em] text-ash">{formatPrice(price, currency)}</s>}
    </span>
  );
}

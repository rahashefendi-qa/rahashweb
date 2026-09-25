import Link from "next/link";
import type { OrderStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: React.ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="display text-4xl md:text-5xl">{title}</h1>
        {description && <p className="mt-2 text-sm text-stone">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, children, className, actions }: { title?: string; children: React.ReactNode; className?: string; actions?: React.ReactNode }) {
  return (
    <section className={cn("border border-line bg-coal", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="eyebrow text-stone">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Stat({ label, value, href, tone }: { label: string; value: string | number; href?: string; tone?: "warn" | "ok" }) {
  const inner = (
    <div className="h-full border border-line bg-coal p-5 transition hover:border-stone/50">
      <p className="eyebrow text-ash">{label}</p>
      <p className={cn("display mt-3 text-4xl tabular-nums", tone === "warn" && "text-brass-soft", tone === "ok" && "text-success")}>{value}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  PREPARING: "Preparing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

const STATUS_STYLE: Record<OrderStatus, string> = {
  PENDING: "bg-brass/15 text-brass-soft border-brass/40",
  CONFIRMED: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  PREPARING: "bg-violet-400/10 text-violet-300 border-violet-400/30",
  SHIPPED: "bg-indigo-400/10 text-indigo-300 border-indigo-400/30",
  DELIVERED: "bg-success/10 text-success border-success/30",
  CANCELLED: "bg-danger/10 text-danger border-danger/30",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center border px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-[0.14em]", STATUS_STYLE[status])}>
      {STATUS_LABEL[status]}
    </span>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="border border-dashed border-line px-6 py-16 text-center">
      <p className="display text-2xl">{title}</p>
      {text && <p className="mt-2 text-sm text-stone">{text}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

export const th = "px-4 py-3 text-left text-[0.65rem] font-medium uppercase tracking-[0.16em] text-ash";
export const td = "px-4 py-3 align-middle";

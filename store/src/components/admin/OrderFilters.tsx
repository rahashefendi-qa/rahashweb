"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { STATUS_LABEL } from "./ui";
import { cn } from "@/lib/utils";

const STATUSES = ["PENDING", "CONFIRMED", "PREPARING", "SHIPPED", "DELIVERED", "CANCELLED"] as const;

export function OrderFilters({ counts }: { counts: Record<string, number> }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");
  const status = params.get("status") ?? "";

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    next.delete("page");
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const s = next.toString();
    router.replace(`${pathname}${s ? `?${s}` : ""}`);
  }

  useEffect(() => {
    if ((params.get("q") ?? "") === q.trim()) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const total = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, name, phone, email, city…" className="field pl-9" type="search" aria-label="Search orders" />
        </label>
        <select value={params.get("payment") ?? ""} onChange={(e) => update({ payment: e.target.value || null })} className="field bg-ink sm:w-48" aria-label="Payment method">
          <option value="">All payments</option>
          <option value="COD">Cash on Delivery</option>
          <option value="WISH_MONEY">Wish Money</option>
        </select>
      </div>
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {[{ key: "", label: "All", n: total }, ...STATUSES.map((s) => ({ key: s, label: STATUS_LABEL[s], n: counts[s] ?? 0 }))].map((s) => (
          <button
            key={s.key}
            onClick={() => update({ status: s.key || null })}
            className={cn("shrink-0 border px-3 py-1.5 text-xs transition", status === s.key ? "border-paper bg-paper text-ink" : "border-line text-stone hover:text-paper")}
          >
            {s.label} <span className="opacity-60">{s.n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Copy, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { deleteProduct, duplicateProduct, quickUpdateStock } from "@/app/actions/admin-products";
import { cn } from "@/lib/utils";

export function ProductRowActions({ id, slug }: { id: string; slug: string }) {
  const [pending, start] = useTransition();
  const btn = "p-2 text-stone transition hover:text-paper disabled:opacity-40";
  return (
    <div className="inline-flex items-center gap-1">
      <Link href={`/admin/products/${id}`} className={btn} aria-label="Edit" title="Edit"><Pencil size={15} /></Link>
      <Link href={`/product/${slug}`} target="_blank" className={btn} aria-label="View in store" title="View in store"><ExternalLink size={15} /></Link>
      <button disabled={pending} onClick={() => start(() => duplicateProduct(id))} className={btn} aria-label="Duplicate" title="Duplicate"><Copy size={15} /></button>
      <button
        disabled={pending}
        onClick={() => confirm("Delete this product permanently? Past orders keep their details.") && start(() => deleteProduct(id))}
        className={cn(btn, "hover:text-danger")}
        aria-label="Delete"
        title="Delete"
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

export function StockInput({ id, stock }: { id: string; stock: number }) {
  const [value, setValue] = useState(String(stock));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, start] = useTransition();

  function save() {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0 || n === stock) {
      setValue(String(stock));
      return;
    }
    setState("saving");
    start(async () => {
      const r = await quickUpdateStock(id, n);
      setState(r.ok ? "saved" : "error");
      setTimeout(() => setState("idle"), 1500);
    });
  }

  return (
    <input
      value={value}
      onChange={(e) => setValue(e.target.value.replace(/[^\d]/g, ""))}
      onBlur={save}
      onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
      inputMode="numeric"
      aria-label="Stock quantity"
      className={cn(
        "w-16 border bg-transparent px-2 py-1 text-sm tabular-nums focus:outline-none",
        state === "saved" ? "border-success" : state === "error" ? "border-danger" : "border-line focus:border-stone",
      )}
    />
  );
}

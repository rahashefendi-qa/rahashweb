"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function QtyStepper({
  value,
  max,
  onChange,
  size = "md",
  className,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const h = size === "sm" ? "h-9" : "h-12";
  return (
    <div className={cn("inline-flex items-center border border-line", h, className)}>
      <button
        type="button"
        className={cn("grid place-items-center text-stone transition hover:text-paper disabled:opacity-30", size === "sm" ? "w-9" : "w-12", h)}
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        aria-label="Decrease quantity"
      >
        <Minus size={14} strokeWidth={1.5} />
      </button>
      <span className={cn("min-w-8 text-center text-sm tabular-nums")} aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className={cn("grid place-items-center text-stone transition hover:text-paper disabled:opacity-30", size === "sm" ? "w-9" : "w-12", h)}
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label="Increase quantity"
      >
        <Plus size={14} strokeWidth={1.5} />
      </button>
    </div>
  );
}

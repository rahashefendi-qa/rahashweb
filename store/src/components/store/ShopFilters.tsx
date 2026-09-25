"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Cat = { name: string; slug: string };

/**
 * Search, filters and sorting — all state lives in the URL so results are
 * shareable, server-rendered and work with the back button.
 */
export function ShopFilters({
  categories,
  total,
  lockedCategory,
  children,
}: {
  categories: Cat[];
  total: number;
  lockedCategory?: boolean;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [panel, setPanel] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (params.get("focus") === "search") searchRef.current?.focus();
  }, [params]);

  function update(patch: Record<string, string | null>) {
    const next = new URLSearchParams(params.toString());
    next.delete("focus");
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const qs = next.toString();
    startTransition(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }));
  }

  // Debounced search
  useEffect(() => {
    const current = params.get("q") ?? "";
    if (q.trim() === current) return;
    const t = setTimeout(() => update({ q: q.trim() || null }), 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const activeCat = params.get("category") ?? "";
  const sort = params.get("sort") ?? "newest";
  const inStock = params.get("availability") === "in-stock";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const activeCount = [!lockedCategory && activeCat, inStock, min, max].filter(Boolean).length;

  const sortSelect = (className: string, label: boolean) => (
    <select
      value={sort}
      onChange={(e) => update({ sort: e.target.value === "newest" ? null : e.target.value })}
      className={className}
      aria-label="Sort products"
    >
      <option value="newest">{label ? "Sort: " : ""}Newest</option>
      <option value="price-asc">Price: low to high</option>
      <option value="price-desc">Price: high to low</option>
    </select>
  );

  const filterBody = (
    <div className="space-y-9">
      {!lockedCategory && (
        <fieldset>
          <legend className="eyebrow mb-3 text-ash">Category</legend>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:items-start lg:gap-1">
            {[{ name: "All bags", slug: "" }, ...categories].map((c) => (
              <button
                key={c.slug}
                onClick={() => update({ category: c.slug || null })}
                className={cn(
                  "border px-4 py-2 text-xs transition lg:border-0 lg:px-0 lg:py-1.5 lg:text-sm",
                  activeCat === c.slug
                    ? "border-paper bg-paper text-ink lg:bg-transparent lg:text-paper"
                    : "border-line text-stone hover:border-stone hover:text-paper",
                )}
                aria-pressed={activeCat === c.slug}
              >
                {c.name}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      <fieldset>
        <legend className="eyebrow mb-3 text-ash">Price (USD)</legend>
        <PriceRange min={min} max={max} onApply={(a, b) => update({ min: a || null, max: b || null })} />
      </fieldset>
      <fieldset>
        <legend className="eyebrow mb-3 text-ash">Availability</legend>
        <label className="flex cursor-pointer items-center gap-3 text-sm text-stone">
          <input
            type="checkbox"
            checked={inStock}
            onChange={(e) => update({ availability: e.target.checked ? "in-stock" : null })}
            className="h-4 w-4 accent-[var(--color-brass)]"
          />
          In stock only
        </label>
      </fieldset>
      {activeCount > 0 && (
        <button
          onClick={() => update({ category: null, min: null, max: null, availability: null })}
          className="text-xs text-stone underline underline-offset-4 hover:text-paper"
        >
          Clear filters
        </button>
      )}
    </div>
  );

  return (
    <>
      <div className="sticky top-16 z-30 -mx-5 border-b border-line bg-ink/90 px-5 py-3 backdrop-blur-xl md:top-20 md:-mx-10 md:px-10 xl:-mx-14 xl:px-14">
        <div className="flex items-center gap-3">
          <label className="relative flex flex-1 items-center md:max-w-sm">
            <Search size={16} strokeWidth={1.4} className="pointer-events-none absolute left-3 text-ash" />
            <span className="sr-only">Search products</span>
            <input
              ref={searchRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search bags, colours…"
              className="h-11 w-full border border-line bg-transparent pl-10 pr-9 text-base placeholder:text-ash focus:border-stone focus:outline-none md:text-sm"
              type="search"
              enterKeyHint="search"
              maxLength={80}
            />
            {q && (
              <button onClick={() => setQ("")} className="absolute right-2 p-1 text-ash hover:text-paper" aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </label>
          <button
            onClick={() => setPanel(true)}
            className="flex h-11 items-center gap-2 border border-line px-4 text-xs uppercase tracking-[0.18em] text-stone transition hover:text-paper lg:hidden"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} /> Filter{activeCount ? ` (${activeCount})` : ""}
          </button>
          <div className="ml-auto hidden sm:block">
            {sortSelect("h-11 border border-line bg-ink px-3 text-sm text-paper focus:border-stone focus:outline-none", true)}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs text-ash">
          <span aria-live="polite">{pending ? "Updating…" : `${total} ${total === 1 ? "piece" : "pieces"}`}</span>
          <div className="sm:hidden">{sortSelect("bg-transparent text-xs text-stone", true)}</div>
        </div>
      </div>

      <div className="mt-10 lg:grid lg:grid-cols-[200px_1fr] lg:gap-12">
        <aside className="hidden lg:block" aria-label="Filters">
          <div className="sticky top-48">{filterBody}</div>
        </aside>
        <div className={cn("transition-opacity duration-300", pending && "opacity-50")}>{children}</div>
      </div>

      <AnimatePresence>
        {panel && (
          <motion.div className="fixed inset-0 z-[70] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/60" onClick={() => setPanel(false)} />
            <motion.div
              className="absolute inset-x-0 bottom-0 max-h-[85dvh] overflow-y-auto bg-coal px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
            >
              <div className="mb-6 flex items-center justify-between">
                <p className="eyebrow">Filters</p>
                <button onClick={() => setPanel(false)} className="p-2" aria-label="Close filters">
                  <X size={18} />
                </button>
              </div>
              {filterBody}
              <button onClick={() => setPanel(false)} className="mt-8 h-12 w-full bg-paper text-xs uppercase tracking-[0.2em] text-ink">
                Show {total} results
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PriceRange({ min, max, onApply }: { min: string; max: string; onApply: (min: string, max: string) => void }) {
  const [a, setA] = useState(min);
  const [b, setB] = useState(max);
  useEffect(() => {
    setA(min);
    setB(max);
  }, [min, max]);
  const input =
    "h-10 w-20 border border-line bg-transparent px-3 text-base focus:border-stone focus:outline-none md:text-sm";
  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        onApply(a, b);
      }}
    >
      <input value={a} onChange={(e) => setA(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="Min" aria-label="Minimum price" className={input} />
      <span className="text-ash">—</span>
      <input value={b} onChange={(e) => setB(e.target.value.replace(/[^\d]/g, ""))} inputMode="numeric" placeholder="Max" aria-label="Maximum price" className={input} />
      <button className="h-10 border border-line px-3 text-xs uppercase tracking-[0.15em] text-stone hover:text-paper">Go</button>
    </form>
  );
}

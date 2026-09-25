"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProduct } from "@/app/actions/admin-products";
import { Button, Spinner } from "@/components/ui/Button";
import { centsToInput, toCents } from "@/lib/money";
import { cn, slugify } from "@/lib/utils";
import type { ProductFormValues } from "@/lib/product-defaults";
import { ImageManager } from "./ImageManager";

export function ProductForm({ id, initial, categories }: { id: string | null; initial: ProductFormValues; categories: { id: string; name: string }[] }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [price, setPrice] = useState(initial.price ? centsToInput(initial.price) : "");
  const [salePrice, setSalePrice] = useState(centsToInput(initial.salePrice));
  const [slugTouched, setSlugTouched] = useState(!!initial.slug);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  function set<K extends keyof ProductFormValues>(k: K, value: ProductFormValues[K]) {
    setV((s) => ({ ...s, [k]: value }));
    setErrors((e) => ({ ...e, [k]: "" }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    const priceCents = toCents(price);
    const saleCents = salePrice.trim() ? toCents(salePrice) : null;
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      setErrors({ price: "Enter a price" });
      return;
    }
    start(async () => {
      const res = await saveProduct(id, {
        ...v,
        price: priceCents,
        salePrice: saleCents,
        images: v.images.map(({ url, storageId, alt, width, height }) => ({ url, storageId: storageId ?? null, alt: alt || null, width: width ?? null, height: height ?? null })),
      });
      if (res.ok) {
        setMessage({ ok: true, text: "Saved." });
        if (!id) router.replace(`/admin/products/${res.id}?created=1`);
        else router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        setMessage({ ok: false, text: res.message });
      }
    });
  }

  return (
    <form onSubmit={submit} className="grid gap-6 xl:grid-cols-[1fr_340px]">
      <div className="space-y-6">
        <Panel title="Basics">
          <F label="Product name" error={errors.name}>
            <input
              value={v.name}
              onChange={(e) => {
                set("name", e.target.value);
                if (!slugTouched) set("slug", slugify(e.target.value));
              }}
              className="field"
              required
              maxLength={120}
            />
          </F>
          <F label="URL" hint={`/product/${v.slug || "…"}`} error={errors.slug}>
            <input
              value={v.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"));
              }}
              className="field"
              maxLength={90}
            />
          </F>
          <F label="Description" error={errors.description}>
            <textarea value={v.description} onChange={(e) => set("description", e.target.value)} rows={5} className="field" maxLength={5000} />
          </F>
          <F label="Product details" hint="One bullet point per line" error={errors.details}>
            <textarea value={v.details} onChange={(e) => set("details", e.target.value)} rows={4} className="field" maxLength={3000} />
          </F>
        </Panel>

        <Panel title="Images">
          <ImageManager images={v.images} onChange={(imgs) => set("images", imgs)} />
          {errors.images && <p className="mt-2 text-xs text-danger">{errors.images}</p>}
        </Panel>

        <Panel title="Specifications">
          <div className="grid gap-4 sm:grid-cols-2">
            <F label="Colour"><input value={v.color ?? ""} onChange={(e) => set("color", e.target.value)} className="field" maxLength={80} /></F>
            <F label="Material"><input value={v.material ?? ""} onChange={(e) => set("material", e.target.value)} className="field" maxLength={160} /></F>
            <F label="Dimensions" hint="e.g. 22 × 17 × 7 cm"><input value={v.dimensions ?? ""} onChange={(e) => set("dimensions", e.target.value)} className="field" maxLength={160} /></F>
            <F label="Strap details"><input value={v.strapDetails ?? ""} onChange={(e) => set("strapDetails", e.target.value)} className="field" maxLength={300} /></F>
          </div>
        </Panel>

        <Panel title="Search engines (optional)">
          <F label="SEO title"><input value={v.seoTitle ?? ""} onChange={(e) => set("seoTitle", e.target.value)} className="field" maxLength={120} placeholder={v.name} /></F>
          <F label="SEO description"><textarea value={v.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} rows={2} className="field" maxLength={300} /></F>
        </Panel>
      </div>

      <div className="space-y-6">
        <Panel title="Pricing">
          <F label="Price (USD)" error={errors.price}>
            <input value={price} onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="field" required aria-invalid={!!errors.price} />
          </F>
          <F label="Sale price (optional)" hint="Leave empty for no sale" error={errors.salePrice}>
            <input value={salePrice} onChange={(e) => setSalePrice(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="field" aria-invalid={!!errors.salePrice} />
          </F>
        </Panel>

        <Panel title="Inventory">
          <F label="Stock quantity" error={errors.stock}>
            <input value={String(v.stock)} onChange={(e) => set("stock", Number(e.target.value.replace(/[^\d]/g, "")) || 0)} inputMode="numeric" className="field" />
          </F>
          <Toggle label="Mark as sold out" hint="Shows Sold Out even if stock remains" checked={v.soldOut} onChange={(c) => set("soldOut", c)} />
          {!v.soldOut && v.stock === 0 && <p className="text-xs text-brass-soft">Stock is 0 — this product shows as Sold Out.</p>}
        </Panel>

        <Panel title="Organisation">
          <F label="Category">
            <select value={v.categoryId ?? ""} onChange={(e) => set("categoryId", e.target.value || null)} className="field bg-ink">
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </F>
          <Toggle label="Visible in store" checked={v.active} onChange={(c) => set("active", c)} />
          <Toggle label="Featured on homepage" checked={v.featured} onChange={(c) => set("featured", c)} />
          <Toggle label="New arrival" checked={v.newArrival} onChange={(c) => set("newArrival", c)} />
        </Panel>

        <div className="sticky bottom-4 z-10 space-y-2 border border-line bg-coal p-4 shadow-[0_-12px_40px_rgba(0,0,0,0.5)] xl:static xl:shadow-none">
          <Button type="submit" className="w-full" disabled={pending}>{pending ? <Spinner /> : id ? "Save changes" : "Create product"}</Button>
          {message && <p role="status" className={cn("text-center text-xs", message.ok ? "text-success" : "text-danger")}>{message.text}</p>}
          <Link href="/admin/products" className="block text-center text-xs text-stone hover:text-paper">Cancel</Link>
        </div>
      </div>
    </form>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border border-line bg-coal">
      <h2 className="eyebrow border-b border-line px-5 py-3 text-stone">{title}</h2>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function F({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs text-stone">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1 block text-xs text-ash">{hint}</span> : null}
    </label>
  );
}

export function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (c: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4">
      <span className="text-sm">
        {label}
        {hint && <span className="block text-xs text-ash">{hint}</span>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn("relative h-6 w-11 shrink-0 rounded-full border transition", checked ? "border-brass bg-brass" : "border-line bg-ink")}
      >
        <span className={cn("absolute top-0.5 h-4.5 w-4.5 rounded-full transition-all", checked ? "left-[22px] bg-ink" : "left-0.5 bg-stone")} />
      </button>
    </label>
  );
}

"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { saveSettings } from "@/app/actions/admin-settings";
import { Button, Spinner } from "@/components/ui/Button";
import { GOVERNORATES } from "@/lib/lebanon";
import { centsToInput, toCents } from "@/lib/money";
import { cn } from "@/lib/utils";
import { uploadImage } from "./ImageManager";
import { Toggle } from "./ProductForm";

type Values = {
  storeName: string;
  tagline: string;
  logoUrl: string | null;
  heroImageUrl: string | null;
  storeEmail: string;
  adminEmail: string;
  phone: string;
  whatsapp: string;
  currency: string;
  deliveryFee: number;
  governorateFees: Record<string, number>;
  freeDeliveryOver: number | null;
  codEnabled: boolean;
  wishMoneyEnabled: boolean;
  wishMoneyName: string;
  wishMoneyNumber: string;
  wishMoneyInstructions: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
};

export function SettingsForm({ initial, system }: { initial: Values; system: { email: string | null; storage: string } }) {
  const router = useRouter();
  const [v, setV] = useState(initial);
  const [fee, setFee] = useState(centsToInput(initial.deliveryFee));
  const [freeOver, setFreeOver] = useState(centsToInput(initial.freeDeliveryOver));
  const [govFees, setGovFees] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(initial.governorateFees).map(([k, c]) => [k, centsToInput(c)])),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();

  const set = <K extends keyof Values>(k: K, val: Values[K]) => setV((s) => ({ ...s, [k]: val }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    const governorateFees: Record<string, number> = {};
    for (const [k, val] of Object.entries(govFees)) if (val.trim() !== "") governorateFees[k] = toCents(val);
    start(async () => {
      const res = await saveSettings({
        ...v,
        deliveryFee: toCents(fee || "0"),
        freeDeliveryOver: freeOver.trim() ? toCents(freeOver) : null,
        governorateFees,
      });
      if (res.ok) {
        setErrors({});
        setMsg({ ok: true, text: "Settings saved." });
        router.refresh();
      } else {
        setErrors(res.fieldErrors ?? {});
        setMsg({ ok: false, text: res.message });
      }
    });
  }

  const text = (k: keyof Values, label: string, opts: { hint?: string; type?: string; placeholder?: string; max?: number } = {}) => (
    <F label={label} hint={opts.hint} error={errors[k]}>
      <input
        type={opts.type ?? "text"}
        value={String(v[k] ?? "")}
        onChange={(e) => set(k, e.target.value as never)}
        placeholder={opts.placeholder}
        maxLength={opts.max ?? 160}
        className="field"
        aria-invalid={!!errors[k]}
      />
    </F>
  );

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-6">
      <Panel title="Brand">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("storeName", "Store name", { hint: "Shown in the header, emails and page titles", max: 60 })}
          {text("tagline", "Homepage headline", { placeholder: "Carry Confidence.", max: 120 })}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <SingleImage label="Logo (optional)" hint="Transparent PNG/WebP. Replaces the text logo." url={v.logoUrl} onChange={(u) => set("logoUrl", u)} folder="brand" contain />
          <SingleImage label="Homepage hero image" hint="Wide landscape photo, at least 2000px wide." url={v.heroImageUrl} onChange={(u) => set("heroImageUrl", u)} folder="brand" />
        </div>
      </Panel>

      <Panel title="Contact & notifications">
        <div className="grid gap-4 sm:grid-cols-2">
          {text("adminEmail", "Admin email", { type: "email", hint: "New-order alerts are sent here" })}
          {text("storeEmail", "Public store email", { type: "email", hint: "Shown in the footer; replies go here" })}
          {text("phone", "Phone number", { placeholder: "+961 3 123 456", max: 40 })}
          {text("whatsapp", "WhatsApp number", { placeholder: "+961 3 123 456", max: 40 })}
        </div>
        <p className="text-xs text-ash">
          Email delivery: {system.email ? <span className="text-success">{system.email}</span> : <span className="text-danger">not configured — see README “Email”</span>}
        </p>
      </Panel>

      <Panel title="Payments">
        <Toggle label="Cash on Delivery" checked={v.codEnabled} onChange={(c) => set("codEnabled", c)} />
        <Toggle label="Wish Money" hint="Customers transfer manually; you verify the payment" checked={v.wishMoneyEnabled} onChange={(c) => set("wishMoneyEnabled", c)} />
        {v.wishMoneyEnabled && (
          <div className="space-y-4 border-l border-brass/40 pl-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("wishMoneyNumber", "Wish Money number / account", { placeholder: "e.g. 03 123 456", max: 60 })}
              {text("wishMoneyName", "Account holder name", { max: 120 })}
            </div>
            <F label="Instructions shown at checkout" error={errors.wishMoneyInstructions}>
              <textarea value={v.wishMoneyInstructions} onChange={(e) => set("wishMoneyInstructions", e.target.value)} rows={3} maxLength={1000} className="field" />
            </F>
            {!v.wishMoneyNumber && <p className="text-xs text-brass-soft">Wish Money stays hidden at checkout until a number is entered.</p>}
          </div>
        )}
      </Panel>

      <Panel title="Delivery">
        <div className="grid gap-4 sm:grid-cols-3">
          <F label="Currency" error={errors.currency}>
            <input value={v.currency} onChange={(e) => set("currency", e.target.value.toUpperCase().slice(0, 3))} className="field" />
          </F>
          <F label="Default delivery fee" error={errors.deliveryFee}>
            <input value={fee} onChange={(e) => setFee(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="field" />
          </F>
          <F label="Free delivery over (optional)" error={errors.freeDeliveryOver}>
            <input value={freeOver} onChange={(e) => setFreeOver(e.target.value.replace(/[^\d.]/g, ""))} inputMode="decimal" className="field" placeholder="—" />
          </F>
        </div>
        <div>
          <p className="mb-2 text-xs text-stone">Fee per governorate — leave empty to use the default fee</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {GOVERNORATES.map((g) => (
              <label key={g.name} className="flex items-center justify-between gap-3 border border-line px-3 py-2 text-sm">
                <span>{g.name}</span>
                <input
                  value={govFees[g.name] ?? ""}
                  onChange={(e) => setGovFees((f) => ({ ...f, [g.name]: e.target.value.replace(/[^\d.]/g, "") }))}
                  inputMode="decimal"
                  placeholder={fee || "0"}
                  className="w-20 border-b border-line bg-transparent text-right tabular-nums focus:border-stone focus:outline-none"
                  aria-label={`Delivery fee for ${g.name}`}
                />
              </label>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="Social media">
        <div className="grid gap-4 sm:grid-cols-3">
          {text("instagramUrl", "Instagram URL", { placeholder: "https://instagram.com/…", max: 300 })}
          {text("facebookUrl", "Facebook URL", { placeholder: "https://facebook.com/…", max: 300 })}
          {text("tiktokUrl", "TikTok URL", { placeholder: "https://tiktok.com/@…", max: 300 })}
        </div>
      </Panel>

      <div className="sticky bottom-4 flex items-center gap-4 border border-line bg-coal p-4">
        <Button type="submit" disabled={pending}>{pending ? <Spinner /> : "Save settings"}</Button>
        {msg && <p role="status" className={cn("text-sm", msg.ok ? "text-success" : "text-danger")}>{msg.text}</p>}
        <p className="ml-auto hidden text-xs text-ash sm:block">Image storage: {system.storage}</p>
      </div>
    </form>
  );
}

function SingleImage({ label, hint, url, onChange, folder, contain }: { label: string; hint: string; url: string | null; onChange: (u: string | null) => void; folder: "brand"; contain?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div>
      <span className="mb-1.5 block text-xs text-stone">{label}</span>
      <div className="flex items-center gap-4 border border-line p-3">
        <div className="relative h-16 w-28 shrink-0 bg-graphite">
          {url && <Image src={url} alt="" fill sizes="112px" className={contain ? "object-contain p-1" : "object-cover"} />}
        </div>
        <div className="space-x-3 text-xs">
          <button type="button" onClick={() => ref.current?.click()} className="text-paper underline underline-offset-4" disabled={busy}>
            {busy ? "Uploading…" : url ? "Replace" : "Upload"}
          </button>
          {url && <button type="button" onClick={() => onChange(null)} className="text-danger">Remove</button>}
        </div>
      </div>
      <span className="mt-1 block text-xs text-ash">{err ?? hint}</span>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          setBusy(true);
          setErr(null);
          try {
            onChange((await uploadImage(f, folder)).url);
          } catch (x) {
            setErr(x instanceof Error ? x.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
    </div>
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

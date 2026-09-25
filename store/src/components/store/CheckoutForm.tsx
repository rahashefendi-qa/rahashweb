"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Check, ChevronDown, Copy, Lock, Wallet } from "lucide-react";
import { placeOrder } from "@/app/actions/checkout";
import { Button, ButtonLink, Spinner } from "@/components/ui/Button";
import { cartSubtotal, useCart } from "@/lib/cart-store";
import { computeDeliveryFee } from "@/lib/delivery";
import { GOVERNORATES } from "@/lib/lebanon";
import { formatPrice } from "@/lib/money";
import { cn } from "@/lib/utils";
import { checkoutSchema } from "@/lib/validation";
import { useStore } from "./StoreProvider";
import { useCartSync } from "./useCartSync";

type Form = {
  fullName: string;
  phone: string;
  email: string;
  governorate: string;
  city: string;
  area: string;
  address: string;
  building: string;
  notes: string;
  paymentMethod: "COD" | "WISH_MONEY" | "";
  paymentReference: string;
  website: string;
};

const EMPTY: Form = {
  fullName: "",
  phone: "",
  email: "",
  governorate: "",
  city: "",
  area: "",
  address: "",
  building: "",
  notes: "",
  paymentMethod: "",
  paymentReference: "",
  website: "",
};

export function CheckoutForm() {
  const settings = useStore();
  const router = useRouter();
  const { items, hydrated, clear } = useCart();
  const [form, setForm] = useState<Form>(() => ({
    ...EMPTY,
    paymentMethod: settings.codEnabled ? "COD" : settings.wishMoneyEnabled ? "WISH_MONEY" : "",
  }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  useCartSync(true, (names) => setNotice(`${names.join(", ")} is no longer available and was removed.`));

  const subtotal = cartSubtotal(items);
  const delivery = computeDeliveryFee(settings, subtotal, form.governorate || null);
  const total = subtotal + delivery;
  const cities = useMemo(() => GOVERNORATES.find((g) => g.name === form.governorate)?.cities ?? [], [form.governorate]);

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: "" }));
  }

  function payload() {
    return {
      ...form,
      paymentMethod: form.paymentMethod as "COD" | "WISH_MONEY",
      items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    };
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    const check = checkoutSchema.safeParse(payload());
    if (!check.success) {
      const next: Record<string, string> = {};
      for (const issue of check.error.issues) {
        const k = String(issue.path[0]);
        if (!next[k]) next[k] = issue.message;
      }
      setErrors(next);
      setFormError("Please check the highlighted fields.");
      const first = document.querySelector<HTMLElement>(`[name="${Object.keys(next)[0]}"]`);
      first?.focus();
      return;
    }
    startTransition(async () => {
      const res = await placeOrder(payload());
      if (res.ok) {
        clear();
        router.push(`/order/${res.token}`);
      } else {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.message);
      }
    });
  }

  if (!hydrated) return <div className="skeleton mt-10 h-96 w-full" />;

  if (items.length === 0) {
    return (
      <div className="mt-10 border border-dashed border-line px-6 py-24 text-center">
        <p className="display text-3xl">Your cart is empty</p>
        <ButtonLink href="/shop" size="lg" className="mt-8">Continue shopping</ButtonLink>
      </div>
    );
  }

  const summary = (
    <div className="space-y-5">
      <ul className="space-y-4">
        {items.map((i) => (
          <li key={i.productId} className="flex items-center gap-4">
            <div className="relative aspect-[4/5] w-14 shrink-0 bg-bone">
              {i.image && <Image src={i.image} alt="" fill sizes="56px" className="object-cover" />}
              <span className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-stone text-[0.65rem] font-semibold text-ink">{i.quantity}</span>
            </div>
            <span className="flex-1 text-sm">{i.name}</span>
            <span className="text-sm tabular-nums">{formatPrice(i.unitPrice * i.quantity, settings.currency)}</span>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 border-t border-line pt-5 text-sm">
        <div className="flex justify-between"><dt className="text-stone">Subtotal</dt><dd className="tabular-nums">{formatPrice(subtotal, settings.currency)}</dd></div>
        <div className="flex justify-between">
          <dt className="text-stone">Delivery{form.governorate ? ` · ${form.governorate}` : ""}</dt>
          <dd className="tabular-nums">{delivery === 0 ? "Free" : formatPrice(delivery, settings.currency)}</dd>
        </div>
        <div className="flex justify-between border-t border-line pt-4 text-lg">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatPrice(total, settings.currency)}</dd>
        </div>
      </dl>
    </div>
  );

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-10 lg:mt-12 lg:grid-cols-[1fr_400px] lg:gap-16">
      {/* Mobile summary toggle */}
      <div className="border-y border-line lg:hidden">
        <button type="button" onClick={() => setSummaryOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-sm" aria-expanded={summaryOpen}>
          <span className="flex items-center gap-2 text-stone">
            {summaryOpen ? "Hide" : "Show"} order summary <ChevronDown size={14} className={cn("transition", summaryOpen && "rotate-180")} />
          </span>
          <span className="tabular-nums">{formatPrice(total, settings.currency)}</span>
        </button>
        <AnimatePresence initial={false}>
          {summaryOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="pb-6">{summary}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="space-y-12">
        {notice && <p className="border border-line bg-graphite p-4 text-sm text-brass-soft">{notice}</p>}

        <Section title="Contact" step="01">
          <Field label="Full name" error={errors.fullName} className="sm:col-span-2">
            <input name="fullName" autoComplete="name" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} className="field" aria-invalid={!!errors.fullName} maxLength={100} />
          </Field>
          <Field label="Phone number" hint="Lebanese number — we'll call to confirm" error={errors.phone}>
            <div className="flex">
              <span className="flex items-center border border-r-0 border-line px-3 text-sm text-ash">+961</span>
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="03 123 456" value={form.phone} onChange={(e) => set("phone", e.target.value)} className="field" aria-invalid={!!errors.phone} maxLength={20} />
            </div>
          </Field>
          <Field label="Email (optional)" hint="For your order confirmation" error={errors.email}>
            <input name="email" type="email" inputMode="email" autoComplete="email" value={form.email} onChange={(e) => set("email", e.target.value)} className="field" aria-invalid={!!errors.email} maxLength={160} />
          </Field>
        </Section>

        <Section title="Delivery" step="02">
          <Field label="Governorate" error={errors.governorate}>
            <select name="governorate" value={form.governorate} onChange={(e) => set("governorate", e.target.value)} className="field appearance-none bg-ink" aria-invalid={!!errors.governorate}>
              <option value="">Select governorate</option>
              {GOVERNORATES.map((g) => (
                <option key={g.name} value={g.name}>{g.name}</option>
              ))}
            </select>
          </Field>
          <Field label="City" error={errors.city}>
            <input name="city" list="city-list" autoComplete="address-level2" value={form.city} onChange={(e) => set("city", e.target.value)} className="field" aria-invalid={!!errors.city} maxLength={80} />
            <datalist id="city-list">{cities.map((c) => <option key={c} value={c} />)}</datalist>
          </Field>
          <Field label="Area / neighbourhood" error={errors.area}>
            <input name="area" autoComplete="address-level3" value={form.area} onChange={(e) => set("area", e.target.value)} className="field" aria-invalid={!!errors.area} maxLength={80} />
          </Field>
          <Field label="Building / floor / apartment (optional)" error={errors.building}>
            <input name="building" value={form.building} onChange={(e) => set("building", e.target.value)} className="field" maxLength={120} />
          </Field>
          <Field label="Full address" hint="Street, nearby landmark, directions" error={errors.address} className="sm:col-span-2">
            <textarea name="address" autoComplete="street-address" rows={2} value={form.address} onChange={(e) => set("address", e.target.value)} className="field resize-none" aria-invalid={!!errors.address} maxLength={300} />
          </Field>
          <Field label="Notes (optional)" hint="Preferred delivery time, gift note…" error={errors.notes} className="sm:col-span-2">
            <textarea name="notes" rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} className="field resize-none" maxLength={500} />
          </Field>
          {/* Honeypot — hidden from humans */}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => set("website", e.target.value)} className="absolute -left-[9999px] h-0 w-0 opacity-0" aria-hidden />
        </Section>

        <Section title="Payment" step="03">
          <div className="space-y-3 sm:col-span-2" role="radiogroup" aria-label="Payment method">
            {settings.codEnabled && (
              <PaymentOption
                selected={form.paymentMethod === "COD"}
                onSelect={() => set("paymentMethod", "COD")}
                icon={<Banknote size={18} strokeWidth={1.3} />}
                title="Cash on Delivery"
                text="Pay in cash when your order arrives."
              />
            )}
            {settings.wishMoneyEnabled && (
              <PaymentOption
                selected={form.paymentMethod === "WISH_MONEY"}
                onSelect={() => set("paymentMethod", "WISH_MONEY")}
                icon={<Wallet size={18} strokeWidth={1.3} />}
                title="Wish Money"
                text="Transfer the total from your Wish Money app."
              >
                <div className="mt-5 space-y-4 border-t border-line pt-5 text-sm">
                  <p className="leading-relaxed text-stone">{settings.wishMoneyInstructions}</p>
                  <dl className="grid gap-3 bg-graphite p-4 sm:grid-cols-3">
                    <div>
                      <dt className="eyebrow text-ash">Send to</dt>
                      <dd className="mt-1 flex items-center gap-2 text-base tabular-nums">
                        {settings.wishMoneyNumber}
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard?.writeText(settings.wishMoneyNumber ?? "");
                            setCopied(true);
                            setTimeout(() => setCopied(false), 1500);
                          }}
                          className="text-ash hover:text-paper"
                          aria-label="Copy Wish Money number"
                        >
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                      </dd>
                    </div>
                    {settings.wishMoneyName && (
                      <div><dt className="eyebrow text-ash">Name</dt><dd className="mt-1">{settings.wishMoneyName}</dd></div>
                    )}
                    <div><dt className="eyebrow text-ash">Amount</dt><dd className="mt-1 text-base tabular-nums">{formatPrice(total, settings.currency)}</dd></div>
                  </dl>
                  <Field label="Transfer reference (optional)" hint="Paste it now, or send it to us after ordering" error={errors.paymentReference}>
                    <input name="paymentReference" value={form.paymentReference} onChange={(e) => set("paymentReference", e.target.value)} className="field" maxLength={120} />
                  </Field>
                  <p className="text-xs text-ash">Payments are verified manually by our team — your order is confirmed once we receive the transfer.</p>
                </div>
              </PaymentOption>
            )}
            {!settings.codEnabled && !settings.wishMoneyEnabled && (
              <p className="text-sm text-danger">Online ordering is temporarily unavailable. Please contact us.</p>
            )}
            {errors.paymentMethod && <p className="text-xs text-danger">{errors.paymentMethod}</p>}
          </div>
        </Section>

        {(formError || errors.items) && (
          <p role="alert" className="border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
            {errors.items || formError}
          </p>
        )}

        <div className="space-y-4">
          <Button type="submit" size="lg" className="w-full" disabled={pending || !form.paymentMethod}>
            {pending ? <><Spinner /> Placing order…</> : <>Place order · {formatPrice(total, settings.currency)}</>}
          </Button>
          <p className="flex items-center justify-center gap-2 text-xs text-ash">
            <Lock size={12} /> No account needed. We&apos;ll contact you to confirm before delivery.
          </p>
          <Link href="/cart" className="block text-center text-xs text-stone hover:text-paper">← Back to cart</Link>
        </div>
      </div>

      <aside className="hidden h-fit border border-line p-8 lg:sticky lg:top-28 lg:block">
        <p className="eyebrow mb-6 text-ash">Order summary</p>
        {summary}
      </aside>
    </form>
  );
}

function Section({ title, step, children }: { title: string; step: string; children: React.ReactNode }) {
  return (
    <fieldset>
      <legend className="mb-6 flex items-baseline gap-4">
        <span className="eyebrow text-brass">{step}</span>
        <span className="display text-3xl">{title}</span>
      </legend>
      <div className="grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}

function Field({ label, hint, error, className, children }: { label: string; hint?: string; error?: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-2 block text-xs uppercase tracking-[0.16em] text-stone">{label}</span>
      {children}
      {error ? <span className="mt-1.5 block text-xs text-danger">{error}</span> : hint ? <span className="mt-1.5 block text-xs text-ash">{hint}</span> : null}
    </label>
  );
}

function PaymentOption({
  selected,
  onSelect,
  icon,
  title,
  text,
  children,
}: {
  selected: boolean;
  onSelect: () => void;
  icon: React.ReactNode;
  title: string;
  text: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("border p-5 transition", selected ? "border-paper/70 bg-coal" : "border-line hover:border-stone")}>
      <button type="button" role="radio" aria-checked={selected} onClick={onSelect} className="flex w-full items-center gap-4 text-left">
        <span className={cn("grid h-5 w-5 shrink-0 place-items-center rounded-full border", selected ? "border-paper" : "border-ash")}>
          {selected && <span className="h-2.5 w-2.5 rounded-full bg-paper" />}
        </span>
        <span className="text-brass">{icon}</span>
        <span className="flex-1">
          <span className="block">{title}</span>
          <span className="block text-xs text-ash">{text}</span>
        </span>
      </button>
      <AnimatePresence initial={false}>
        {selected && children && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

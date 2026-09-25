import Link from "next/link";
import type { PublicSettings } from "@/lib/settings";
import { MotionToggle } from "./MotionPreference";

export function Footer({ settings, categories }: { settings: PublicSettings; categories: { name: string; href: string }[] }) {
  const socials = [
    { name: "Instagram", href: settings.instagramUrl },
    { name: "Facebook", href: settings.facebookUrl },
    { name: "TikTok", href: settings.tiktokUrl },
  ].filter((s): s is { name: string; href: string } => !!s.href);
  const wa = settings.whatsapp?.replace(/[^\d]/g, "");

  return (
    <footer className="mt-24 border-t border-line bg-coal">
      <div className="container-x grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-5">
          <p className="display text-3xl tracking-[0.28em]">{settings.storeName}</p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone">
            Premium men&apos;s bags designed for everyday luxury. Delivered across Lebanon — pay cash on delivery or with Wish Money.
          </p>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4 text-ash">Shop</p>
          <ul className="space-y-2.5 text-sm text-stone">
            <li><Link className="transition hover:text-paper" href="/shop">All bags</Link></li>
            {categories.map((c) => (
              <li key={c.href}><Link className="transition hover:text-paper" href={c.href}>{c.name}</Link></li>
            ))}
            <li><Link className="transition hover:text-paper" href="/category/new-arrivals">New Arrivals</Link></li>
          </ul>
        </div>
        <div className="md:col-span-2">
          <p className="eyebrow mb-4 text-ash">Help</p>
          <ul className="space-y-2.5 text-sm text-stone">
            <li><Link className="transition hover:text-paper" href="/cart">Cart</Link></li>
            <li><Link className="transition hover:text-paper" href="/checkout">Checkout</Link></li>
            <li>Delivery across Lebanon</li>
            <li>Cash on Delivery · Wish Money</li>
          </ul>
        </div>
        <div className="md:col-span-3">
          {(settings.phone || wa || settings.storeEmail || socials.length > 0) && <p className="eyebrow mb-4 text-ash">Contact</p>}
          <ul className="space-y-2.5 text-sm text-stone">
            {settings.phone && <li><a className="transition hover:text-paper" href={`tel:${settings.phone.replace(/\s/g, "")}`}>{settings.phone}</a></li>}
            {wa && <li><a className="transition hover:text-paper" href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>}
            {settings.storeEmail && <li><a className="transition hover:text-paper" href={`mailto:${settings.storeEmail}`}>{settings.storeEmail}</a></li>}
            {socials.map((s) => (
              <li key={s.name}><a className="transition hover:text-paper" href={s.href} target="_blank" rel="noopener noreferrer">{s.name}</a></li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-x flex flex-col gap-3 border-t border-line py-6 text-xs text-ash md:flex-row md:items-center md:justify-between">
        <p>© {new Date().getFullYear()} {settings.storeName}. All rights reserved.</p>
        <div className="flex gap-6">
          <MotionToggle />
        </div>
      </div>
    </footer>
  );
}

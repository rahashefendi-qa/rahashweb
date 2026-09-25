"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, FolderTree, LayoutGrid, LogOut, Menu, Package, Settings, ShoppingCart, UserCog, Users, X } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutGrid },
  { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: FolderTree },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/account", label: "Account", icon: UserCog },
];

export function AdminNav({ storeName, email, pendingOrders }: { storeName: string; email: string; pendingOrders: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const links = (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => (
        <Link
          key={n.href}
          href={n.href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 text-sm transition",
            isActive(n.href) ? "bg-graphite text-paper" : "text-stone hover:bg-coal hover:text-paper",
          )}
        >
          <n.icon size={16} strokeWidth={1.5} />
          <span className="flex-1">{n.label}</span>
          {n.href === "/admin/orders" && pendingOrders > 0 && (
            <span className="rounded-full bg-brass px-2 py-0.5 text-[0.65rem] font-semibold text-ink">{pendingOrders}</span>
          )}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-1 border-t border-line pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-3 px-3 py-2 text-sm text-stone hover:text-paper">
        <ExternalLink size={16} strokeWidth={1.5} /> View store
      </Link>
      <form action={logout}>
        <button className="flex w-full items-center gap-3 px-3 py-2 text-sm text-stone hover:text-paper">
          <LogOut size={16} strokeWidth={1.5} /> Sign out
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-xs text-ash">{email}</p>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-ink/95 px-4 backdrop-blur lg:hidden">
        <button onClick={() => setOpen(true)} className="-ml-2 p-2" aria-label="Open admin menu">
          <Menu size={20} strokeWidth={1.5} />
        </button>
        <span className="display tracking-[0.25em]">{storeName}</span>
        <Link href="/admin/orders" className="relative p-2" aria-label="Orders">
          <ShoppingCart size={18} strokeWidth={1.5} />
          {pendingOrders > 0 && <span className="absolute right-0 top-0 rounded-full bg-brass px-1.5 text-[0.6rem] font-semibold text-ink">{pendingOrders}</span>}
        </Link>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col justify-between bg-coal p-4">
            <div>
              <div className="mb-6 flex items-center justify-between">
                <span className="display tracking-[0.25em]">{storeName}</span>
                <button onClick={() => setOpen(false)} className="p-2" aria-label="Close menu"><X size={18} /></button>
              </div>
              {links}
            </div>
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col justify-between border-r border-line bg-coal p-4 lg:flex">
        <div>
          <Link href="/admin" className="mb-8 block px-3 pt-2">
            <span className="display block text-xl tracking-[0.25em]">{storeName}</span>
            <span className="eyebrow text-ash">Admin</span>
          </Link>
          {links}
        </div>
        {footer}
      </aside>
    </>
  );
}

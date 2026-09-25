"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { cartCount, useCart } from "@/lib/cart-store";
import { cn } from "@/lib/utils";

type NavItem = { name: string; href: string };

export function Header({ storeName, logoUrl, categories }: { storeName: string; logoUrl: string | null; categories: NavItem[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const items = useCart((s) => s.items);
  const hydrated = useCart((s) => s.hydrated);
  const setOpen = useCart((s) => s.setOpen);
  const count = hydrated ? cartCount(items) : 0;
  const overHero = pathname === "/" && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setMenuOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
  }, [menuOpen]);

  const links: NavItem[] = [{ name: "Shop All", href: "/shop" }, ...categories, { name: "New Arrivals", href: "/category/new-arrivals" }];

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background,border-color,backdrop-filter] duration-500",
          overHero ? "border-b border-transparent bg-transparent" : "border-b border-line/70 bg-ink/85 backdrop-blur-xl",
        )}
      >
        <div className="container-x grid h-16 grid-cols-[1fr_auto_1fr] items-center md:h-20">
          <div className="flex min-w-0 items-center gap-8">
            <button
              className="-ml-2 p-2 lg:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <Menu size={20} strokeWidth={1.4} />
            </button>
            <nav className="hidden items-center gap-6 whitespace-nowrap lg:flex xl:gap-8" aria-label="Primary">
              {links.slice(0, 4).map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "eyebrow relative py-2 text-paper/75 transition hover:text-paper",
                    "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full after:origin-left after:scale-x-0 after:bg-brass after:transition-transform after:duration-500 hover:after:scale-x-100",
                    pathname === l.href && "text-paper after:scale-x-100",
                  )}
                >
                  {l.name.replace(/\s+bags?$/i, "")}
                </Link>
              ))}
            </nav>
          </div>

          <Link href="/" className="flex shrink-0 items-center justify-center px-4" aria-label={`${storeName} home`}>
            {logoUrl ? (
              <Image src={logoUrl} alt={storeName} width={140} height={40} className="h-8 w-auto object-contain md:h-10" priority />
            ) : (
              <span className="display text-xl tracking-[0.32em] md:text-2xl">{storeName}</span>
            )}
          </Link>

          <div className="flex items-center justify-end gap-1 md:gap-3">
            <Link href="/shop?focus=search" className="p-2 text-paper/80 transition hover:text-paper" aria-label="Search products">
              <Search size={19} strokeWidth={1.4} />
            </Link>
            <button
              onClick={() => setOpen(true)}
              className="relative -mr-2 flex items-center gap-2 p-2 text-paper/80 transition hover:text-paper"
              aria-label={`Open cart, ${count} items`}
            >
              <ShoppingBag size={19} strokeWidth={1.4} />
              <AnimatePresence>
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    className="absolute right-0 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[0.6rem] font-semibold text-ink"
                  >
                    {count}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="fixed inset-0 z-[60] bg-ink lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="container-x flex h-16 items-center justify-between">
              <span className="display text-xl tracking-[0.32em]">{storeName}</span>
              <button onClick={() => setMenuOpen(false)} className="-mr-2 p-2" aria-label="Close menu">
                <X size={22} strokeWidth={1.4} />
              </button>
            </div>
            <nav className="container-x mt-10 flex flex-col" aria-label="Mobile">
              {links.map((l, i) => (
                <motion.div
                  key={l.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link href={l.href} className="display block border-b border-line py-4 text-4xl">
                    {l.name}
                  </Link>
                </motion.div>
              ))}
              <Link href="/cart" className="eyebrow mt-10 text-stone">
                Cart ({count})
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

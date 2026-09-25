import { CartDrawer } from "@/components/store/CartDrawer";
import { Footer } from "@/components/store/Footer";
import { Header } from "@/components/store/Header";
import { IntroAnimation } from "@/components/store/IntroAnimation";
import { MotionPreference } from "@/components/store/MotionPreference";
import { StoreProvider } from "@/components/store/StoreProvider";
import { getCategories } from "@/lib/products";
import { getSettings, toPublicSettings } from "@/lib/settings";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);
  const pub = toPublicSettings(settings);
  const nav = categories.map((c) => ({ name: c.name, href: `/category/${c.slug}` }));

  return (
    <StoreProvider settings={pub}>
      <MotionPreference>
      <IntroAnimation storeName={pub.storeName} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-paper focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header storeName={pub.storeName} logoUrl={pub.logoUrl} categories={nav} />
      <main id="main" className="min-h-[60vh]">
        {children}
      </main>
      <Footer settings={pub} categories={nav} />
      <CartDrawer />
      </MotionPreference>
    </StoreProvider>
  );
}

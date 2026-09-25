import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Banknote, Gem, PackageCheck, Ruler, Smartphone, Truck } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Hero } from "@/components/store/Hero";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Reveal } from "@/components/store/Reveal";
import { SectionHeading } from "@/components/store/SectionHeading";
import { getCategories, getFeaturedProducts, NEW_ARRIVALS_SLUG } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";

export const revalidate = 60;

const REASONS = [
  { icon: Gem, title: "Considered craftsmanship", text: "Clean edges, even stitching and hardware chosen to look sharp for years of daily wear." },
  { icon: Ruler, title: "Premium, minimal design", text: "Structured silhouettes and a restrained palette of black, brown, green and grey." },
  { icon: ArrowUpRight, title: "Luxury-inspired, fairly priced", text: "An elevated look and feel without the runway price tag." },
  { icon: Truck, title: "Delivery across Lebanon", text: "From Beirut to Tripoli, Zahle and Saida — delivered to your door." },
  { icon: Banknote, title: "Cash on Delivery", text: "Pay when your bag arrives, or transfer with Wish Money." },
  { icon: Smartphone, title: "Easy ordering", text: "A two-minute checkout. No account needed — we call to confirm." },
];

export default async function HomePage() {
  const [settings, featured, categories] = await Promise.all([getSettings(), getFeaturedProducts(8), getCategories()]);

  const tiles = [
    ...categories.map((c) => ({
      name: c.name,
      href: `/category/${c.slug}`,
      count: c._count.products,
      image: c.products[0]?.images[0]?.url ?? null,
    })),
    { name: "New Arrivals", href: `/category/${NEW_ARRIVALS_SLUG}`, count: null, image: featured.find((f) => f.newArrival)?.hoverImage?.url ?? null },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: settings.storeName,
    url: siteUrl(),
    address: { "@type": "PostalAddress", addressCountry: "LB" },
    ...(settings.phone ? { telephone: settings.phone } : {}),
    paymentAccepted: "Cash, Wish Money",
    currenciesAccepted: settings.currency,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero image={settings.heroImageUrl || "/placeholders/hero.webp"} headline={settings.tagline || "Carry Confidence."} sub="Premium men's bags designed for everyday luxury." />

      {/* Featured collection */}
      <section className="container-x pt-24 md:pt-36" aria-labelledby="featured">
        <SectionHeading eyebrow="Featured" title="The Collection" link={{ href: "/shop", label: "View all" }} />
        {featured.length ? (
          <ProductGrid products={featured} />
        ) : (
          <p className="border border-dashed border-line p-12 text-center text-stone">New pieces are on their way. Check back soon.</p>
        )}
      </section>

      {/* Categories */}
      <section className="container-x pt-28 md:pt-40" aria-label="Shop by category">
        <SectionHeading eyebrow="Shop by" title="Category" />
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {tiles.map((t, i) => (
            <Reveal key={t.href} delay={i * 0.08}>
              <Link href={t.href} className="group relative block aspect-[3/4] overflow-hidden bg-graphite">
                {t.image && (
                  <Image
                    src={t.image}
                    alt=""
                    fill
                    sizes="(min-width: 1024px) 25vw, 50vw"
                    className="object-cover opacity-90 transition duration-[1.4s] ease-[var(--ease-luxe)] group-hover:scale-105 group-hover:opacity-100"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent" />
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between md:inset-x-6 md:bottom-6">
                  <div>
                    <p className="display text-2xl md:text-4xl">{t.name}</p>
                    {t.count != null && <p className="mt-1 text-xs text-stone">{t.count} pieces</p>}
                  </div>
                  <ArrowUpRight className="mb-1 shrink-0 transition duration-500 group-hover:-translate-y-1 group-hover:translate-x-1" size={20} strokeWidth={1.3} />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Editorial statement */}
      <section className="mt-28 bg-paper text-ink md:mt-40">
        <div className="container-x grid items-center gap-12 py-20 md:grid-cols-2 md:py-32">
          <Reveal className="relative aspect-[4/5] overflow-hidden bg-bone">
            <Image src="/placeholders/editorial.webp" alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </Reveal>
          <Reveal delay={0.1}>
            <p className="eyebrow text-ash">Our approach</p>
            <h2 className="display mt-4 text-[clamp(2.6rem,5vw,4.6rem)]">
              Fewer, better <em>pieces.</em>
            </h2>
            <p className="mt-6 max-w-md leading-relaxed text-ink/70">
              We design structured bags for men who value clean lines and quiet confidence — compact enough for every day,
              refined enough for every occasion. Adjustable straps, considered hardware, and a palette that works with everything you own.
            </p>
            <ButtonLink href="/shop" variant="light" size="lg" className="mt-10">Explore the collection</ButtonLink>
          </Reveal>
        </div>
      </section>

      {/* Why choose us */}
      <section className="container-x pt-28 md:pt-36" aria-labelledby="why">
        <SectionHeading eyebrow="Why choose us" title="Made to be carried" />
        <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r, i) => (
            <Reveal key={r.title} delay={(i % 3) * 0.08} className="bg-ink p-8 md:p-10">
              <r.icon size={22} strokeWidth={1.2} className="text-brass" />
              <h3 className="mt-6 text-lg">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-stone">{r.text}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="container-x pt-28 md:pt-40">
        <Reveal className="relative overflow-hidden border border-line px-6 py-20 text-center md:py-32">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(184,155,106,0.12),transparent_65%)]" />
          <PackageCheck className="mx-auto text-brass" size={26} strokeWidth={1.1} />
          <h2 className="display relative mt-6 text-[clamp(2.8rem,7vw,6rem)]">
            Find your <em>everyday</em> bag.
          </h2>
          <p className="relative mx-auto mt-5 max-w-md text-stone">
            Order online in minutes. Delivered anywhere in Lebanon — pay on delivery or with Wish Money.
          </p>
          <ButtonLink href="/shop" size="lg" className="relative mt-10">Shop the collection</ButtonLink>
        </Reveal>
      </section>
    </>
  );
}

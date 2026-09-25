import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Banknote, Truck } from "lucide-react";
import { ProductGallery } from "@/components/store/ProductGallery";
import { ProductGrid } from "@/components/store/ProductGrid";
import { ProductPurchase } from "@/components/store/ProductPurchase";
import { Reveal } from "@/components/store/Reveal";
import { Price } from "@/components/ui/Price";
import { effectivePrice, getProductBySlug, getRelatedProducts, isAvailable } from "@/lib/products";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Product not found" };
  const description = p.seoDescription || p.description.slice(0, 155);
  const image = p.images[0]?.url;
  return {
    title: p.seoTitle || p.name,
    description,
    alternates: { canonical: `/product/${p.slug}` },
    openGraph: {
      title: p.seoTitle || p.name,
      description,
      url: `/product/${p.slug}`,
      images: image ? [{ url: image, width: p.images[0].width ?? 1200, height: p.images[0].height ?? 1500, alt: p.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [settings, related] = await Promise.all([getSettings(), getRelatedProducts(product)]);
  const available = isAvailable(product);
  const images = product.images.map((i) => ({ url: i.url, alt: i.alt || product.name }));
  const details = product.details.split("\n").map((d) => d.trim()).filter(Boolean);

  const specs = [
    ["Colour", product.color],
    ["Material", product.material],
    ["Dimensions", product.dimensions],
    ["Strap", product.strapDetails],
  ].filter((s): s is [string, string] => !!s[1]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: images.map((i) => (i.url.startsWith("http") ? i.url : siteUrl(i.url))),
    sku: product.id,
    color: product.color ?? undefined,
    material: product.material ?? undefined,
    brand: { "@type": "Brand", name: settings.storeName },
    offers: {
      "@type": "Offer",
      url: siteUrl(`/product/${product.slug}`),
      priceCurrency: settings.currency,
      price: (effectivePrice(product) / 100).toFixed(2),
      availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      areaServed: "LB",
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <div className="container-x pt-16 md:pt-28">
        <nav aria-label="Breadcrumb" className="hidden py-4 text-xs text-ash md:block">
          <ol className="flex gap-2">
            <li><Link href="/shop" className="hover:text-paper">Shop</Link></li>
            {product.category && (
              <>
                <li aria-hidden>/</li>
                <li><Link href={`/category/${product.category.slug}`} className="hover:text-paper">{product.category.name}</Link></li>
              </>
            )}
            <li aria-hidden>/</li>
            <li className="text-stone" aria-current="page">{product.name}</li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-16 xl:gap-24">
          <ProductGallery images={images} name={product.name} soldOut={!available} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            <Reveal>
              {product.category && <p className="eyebrow text-brass-soft">{product.category.name}</p>}
              <h1 className="display mt-3 text-[clamp(2.6rem,5vw,4.2rem)]">{product.name}</h1>
              <div className="mt-4 flex items-center gap-4">
                <Price price={product.price} salePrice={product.salePrice} currency={settings.currency} className="text-xl" />
                <span className={`eyebrow ${available ? "text-success" : "text-danger"}`}>{available ? "Available" : "Sold out"}</span>
              </div>

              {product.description && <p className="mt-8 leading-relaxed text-stone">{product.description}</p>}

              <div className="mt-8">
                <ProductPurchase
                  available={available}
                  product={{
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    salePrice: product.salePrice,
                    stock: product.stock,
                    image: images[0]?.url ?? null,
                  }}
                />
              </div>

              <ul className="mt-8 space-y-3 border-y border-line py-6 text-sm text-stone">
                <li className="flex items-center gap-3"><Truck size={16} strokeWidth={1.3} className="text-brass" /> Delivery across all Lebanese governorates</li>
                <li className="flex items-center gap-3"><Banknote size={16} strokeWidth={1.3} className="text-brass" /> Cash on Delivery or Wish Money</li>
              </ul>

              {specs.length > 0 && (
                <dl className="divide-y divide-line">
                  {specs.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[110px_1fr] gap-4 py-4 text-sm">
                      <dt className="eyebrow pt-0.5 text-ash">{k}</dt>
                      <dd className="text-stone">{v}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {details.length > 0 && (
                <details className="group border-t border-line py-5" open>
                  <summary className="eyebrow flex cursor-pointer list-none items-center justify-between text-ash">
                    Product details <span className="text-lg transition group-open:rotate-45">+</span>
                  </summary>
                  <ul className="mt-4 space-y-2 text-sm text-stone">
                    {details.map((d) => (
                      <li key={d} className="flex gap-3"><span className="mt-2 h-px w-3 shrink-0 bg-brass" />{d}</li>
                    ))}
                  </ul>
                </details>
              )}
            </Reveal>
          </div>
        </div>

        {related.length > 0 && (
          <section className="pt-28 md:pt-40" aria-labelledby="related">
            <h2 id="related" className="display mb-10 text-[clamp(2.2rem,4.5vw,3.6rem)]">You may also like</h2>
            <ProductGrid products={related} />
          </section>
        )}
      </div>
    </>
  );
}

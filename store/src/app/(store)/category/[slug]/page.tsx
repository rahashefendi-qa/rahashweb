import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ShopView } from "@/components/store/ShopView";
import { db } from "@/lib/db";
import { NEW_ARRIVALS_SLUG } from "@/lib/products";
import { parseShopParams } from "@/lib/shop-params";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function resolveCategory(slug: string) {
  if (slug === NEW_ARRIVALS_SLUG) {
    return { name: "New Arrivals", slug, description: "The latest additions to the collection." };
  }
  return db.category.findUnique({ where: { slug }, select: { name: true, slug: true, description: true } });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const cat = await resolveCategory(slug);
  if (!cat) return {};
  return {
    title: cat.name,
    description: cat.description ?? `Shop ${cat.name.toLowerCase()} for men. Delivery across Lebanon.`,
    alternates: { canonical: `/category/${cat.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const cat = await resolveCategory(slug);
  if (!cat) notFound();
  const query = { ...parseShopParams(await searchParams), category: cat.slug };
  return <ShopView title={cat.name} eyebrow="Category" intro={cat.description} query={query} lockedCategory />;
}

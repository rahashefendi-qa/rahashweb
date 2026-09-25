import type { Metadata } from "next";
import { ShopView } from "@/components/store/ShopView";
import { parseShopParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Shop All Bags",
  description: "Shop men's crossbody, shoulder and hand-carry bags. Delivery across Lebanon with Cash on Delivery or Wish Money.",
  alternates: { canonical: "/shop" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ShopPage({ searchParams }: Props) {
  const query = parseShopParams(await searchParams);
  return <ShopView title="The Collection" eyebrow="Shop all" query={query} />;
}

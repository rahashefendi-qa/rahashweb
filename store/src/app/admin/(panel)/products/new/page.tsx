import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { EMPTY_PRODUCT } from "@/lib/product-defaults";

export const metadata = { title: "New product" };

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } });
  return (
    <>
      <Link href="/admin/products" className="text-xs text-stone hover:text-paper">← Products</Link>
      <PageHeader title="New product" />
      <ProductForm id={null} initial={{ ...EMPTY_PRODUCT, categoryId: categories[0]?.id ?? null }} categories={categories} />
    </>
  );
}

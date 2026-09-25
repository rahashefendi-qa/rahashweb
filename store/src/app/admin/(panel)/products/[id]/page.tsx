import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { ProductRowActions } from "@/components/admin/ProductRowActions";
import { Card, PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Edit product" };

type Props = { params: Promise<{ id: string }>; searchParams: Promise<Record<string, string | undefined>> };

export default async function EditProductPage({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([
    db.product.findUnique({
      where: { id },
      include: {
        images: { orderBy: { position: "asc" } },
        notifyRequests: { orderBy: { createdAt: "desc" }, take: 50 },
        _count: { select: { orderItems: true } },
      },
    }),
    db.category.findMany({ orderBy: { position: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!product) notFound();

  const { images, notifyRequests, _count } = product;
  const fields = {
    name: product.name, slug: product.slug, description: product.description, details: product.details,
    price: product.price, salePrice: product.salePrice, stock: product.stock, soldOut: product.soldOut,
    featured: product.featured, newArrival: product.newArrival, active: product.active, categoryId: product.categoryId,
    color: product.color, material: product.material, dimensions: product.dimensions, strapDetails: product.strapDetails,
    seoTitle: product.seoTitle, seoDescription: product.seoDescription,
  };

  return (
    <>
      <Link href="/admin/products" className="text-xs text-stone hover:text-paper">← Products</Link>
      <PageHeader
        title={product.name}
        description={`${_count.orderItems} order line${_count.orderItems === 1 ? "" : "s"} · last updated ${formatDate(product.updatedAt)}`}
        actions={<ProductRowActions id={product.id} slug={product.slug} />}
      />
      {sp.created && <p className="mb-6 border border-success/30 bg-success/10 p-3 text-sm text-success">Product created.</p>}
      {sp.duplicated && <p className="mb-6 border border-brass/40 bg-brass/10 p-3 text-sm text-brass-soft">This is a copy. It is hidden from the store with stock 0 until you review and save it.</p>}

      <ProductForm
        key={product.updatedAt.toISOString()}
        id={product.id}
        categories={categories}
        initial={{
          ...fields,
          images: images.map((i) => ({ key: i.id, url: i.url, storageId: i.storageId, alt: i.alt, width: i.width, height: i.height })),
        }}
      />

      {notifyRequests.length > 0 && (
        <Card title={`Back-in-stock requests (${notifyRequests.filter((n) => !n.notifiedAt).length} waiting)`} className="mt-6">
          <p className="mb-3 text-xs text-ash">Customers with an email are notified automatically when this product is back in stock. Contact phone requests manually.</p>
          <ul className="divide-y divide-line text-sm">
            {notifyRequests.map((n) => (
              <li key={n.id} className="flex justify-between py-2">
                <span>{n.email ?? n.phone}</span>
                <span className="text-xs text-ash">{n.notifiedAt ? `notified ${formatDate(n.notifiedAt)}` : `requested ${formatDate(n.createdAt)}`}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}

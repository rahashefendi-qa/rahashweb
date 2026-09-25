import Image from "next/image";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { ProductRowActions, StockInput } from "@/components/admin/ProductRowActions";
import { EmptyState, PageHeader, td, th } from "@/components/admin/ui";
import { ButtonLink } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/money";
import { getSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";

export const metadata = { title: "Products" };

const FILTERS = [
  { key: "", label: "All" },
  { key: "active", label: "Visible" },
  { key: "hidden", label: "Hidden" },
  { key: "sold-out", label: "Sold out" },
  { key: "low", label: "Low stock" },
  { key: "featured", label: "Featured" },
];

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80) ?? "";
  const filter = sp.filter ?? "";
  const where: Prisma.ProductWhereInput = {};
  if (q) where.OR = [{ name: { contains: q, mode: "insensitive" } }, { slug: { contains: q, mode: "insensitive" } }, { color: { contains: q, mode: "insensitive" } }];
  if (filter === "active") where.active = true;
  if (filter === "hidden") where.active = false;
  if (filter === "sold-out") where.AND = [{ OR: [{ stock: 0 }, { soldOut: true }] }];
  if (filter === "low") where.stock = { gt: 0, lte: 3 };
  if (filter === "featured") where.featured = true;

  const [products, settings] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        category: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1 },
        _count: { select: { notifyRequests: { where: { notifiedAt: null } } } },
      },
    }),
    getSettings(),
  ]);

  return (
    <>
      <PageHeader title="Products" description={`${products.length} product${products.length === 1 ? "" : "s"}`} actions={<ButtonLink href="/admin/products/new" size="sm">Add product</ButtonLink>} />
      {sp.deleted && <p className="mb-4 border border-line bg-coal p-3 text-sm text-stone">Product deleted.</p>}

      <form className="mb-4 flex gap-2" role="search">
        <input name="q" defaultValue={q} placeholder="Search products…" className="field flex-1" aria-label="Search products" />
        {filter && <input type="hidden" name="filter" value={filter} />}
        <button className="border border-line px-4 text-xs uppercase tracking-[0.15em] text-stone hover:text-paper">Search</button>
      </form>
      <div className="no-scrollbar -mx-4 mb-6 flex gap-2 overflow-x-auto px-4 md:mx-0 md:px-0">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/products?${new URLSearchParams({ ...(q ? { q } : {}), ...(f.key ? { filter: f.key } : {}) })}`}
            className={cn("shrink-0 border px-3 py-1.5 text-xs transition", filter === f.key ? "border-paper bg-paper text-ink" : "border-line text-stone hover:text-paper")}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <EmptyState title="No products" text={q || filter ? "Nothing matches this search." : "Add your first product to start selling."} action={<ButtonLink href="/admin/products/new" size="sm">Add product</ButtonLink>} />
      ) : (
        <div className="overflow-x-auto border border-line bg-coal">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-line">
              <tr><th className={th}>Product</th><th className={th}>Price</th><th className={th}>Stock</th><th className={th}>Status</th><th className={th}>Category</th><th className={`${th} text-right`}>Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-line">
              {products.map((p) => {
                const soldOut = p.soldOut || p.stock === 0;
                return (
                  <tr key={p.id} className="transition hover:bg-graphite">
                    <td className={td}>
                      <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3 hover:text-brass-soft">
                        <span className="relative aspect-[4/5] w-10 shrink-0 bg-bone">
                          {p.images[0] && <Image src={p.images[0].url} alt="" fill sizes="40px" className="object-cover" />}
                        </span>
                        <span>
                          {p.name}
                          <span className="block text-xs text-ash">/{p.slug}</span>
                        </span>
                      </Link>
                    </td>
                    <td className={`${td} tabular-nums`}>
                      {p.salePrice != null ? (
                        <>{formatPrice(p.salePrice, settings.currency)} <s className="text-xs text-ash">{formatPrice(p.price, settings.currency)}</s></>
                      ) : formatPrice(p.price, settings.currency)}
                    </td>
                    <td className={td}><StockInput id={p.id} stock={p.stock} /></td>
                    <td className={td}>
                      <div className="flex flex-wrap gap-1">
                        {!p.active && <Tag>Hidden</Tag>}
                        {soldOut ? <Tag tone="danger">Sold out</Tag> : p.stock <= 3 ? <Tag tone="warn">Low</Tag> : <Tag tone="ok">In stock</Tag>}
                        {p.featured && <Tag>Featured</Tag>}
                        {p.newArrival && <Tag>New</Tag>}
                        {p._count.notifyRequests > 0 && <Tag tone="warn">{p._count.notifyRequests} waiting</Tag>}
                      </div>
                    </td>
                    <td className={`${td} text-stone`}>{p.category?.name ?? "—"}</td>
                    <td className={`${td} text-right`}><ProductRowActions id={p.id} slug={p.slug} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function Tag({ children, tone }: { children: React.ReactNode; tone?: "ok" | "warn" | "danger" }) {
  return (
    <span className={cn("border px-1.5 py-0.5 text-[0.62rem] uppercase tracking-[0.12em]",
      tone === "ok" ? "border-success/30 text-success" : tone === "warn" ? "border-brass/40 text-brass-soft" : tone === "danger" ? "border-danger/40 text-danger" : "border-line text-stone")}>
      {children}
    </span>
  );
}

import { CategoryForm, DeleteCategoryButton } from "@/components/admin/CategoryForm";
import { Card, PageHeader } from "@/components/admin/ui";
import { db } from "@/lib/db";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await db.category.findMany({ orderBy: { position: "asc" }, include: { _count: { select: { products: true } } } });
  return (
    <>
      <PageHeader title="Categories" description="Shown in the navigation, on the homepage and as shop filters. “New Arrivals” is automatic (products marked as new)." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {categories.map((c) => (
            <Card key={c.id}>
              <details>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4">
                  <span>
                    <span className="text-base">{c.name}</span>
                    <span className="block text-xs text-ash">/category/{c.slug} · {c._count.products} products · order {c.position}</span>
                  </span>
                  <span className="text-xs text-stone">Edit</span>
                </summary>
                <div className="mt-5 border-t border-line pt-5">
                  <CategoryForm category={c} />
                  <DeleteCategoryButton id={c.id} count={c._count.products} />
                </div>
              </details>
            </Card>
          ))}
        </div>
        <Card title="Add category" className="h-fit">
          <CategoryForm />
        </Card>
      </div>
    </>
  );
}

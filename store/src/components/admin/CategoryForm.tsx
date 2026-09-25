"use client";

import { useActionState, useTransition } from "react";
import { deleteCategory, saveCategory, type CatResult } from "@/app/actions/admin-categories";
import { Button, Spinner } from "@/components/ui/Button";
import { Feedback } from "./OrderForms";

type Cat = { id: string; name: string; slug: string; description: string | null; position: number };

export function CategoryForm({ category }: { category?: Cat }) {
  const [state, action, pending] = useActionState<CatResult, FormData>(saveCategory, null);
  return (
    <form action={action} className="space-y-3">
      {category && <input type="hidden" name="id" value={category.id} />}
      <input name="name" defaultValue={category?.name} placeholder="Name, e.g. Crossbody Bags" className="field" required maxLength={60} />
      <input name="slug" defaultValue={category?.slug} placeholder="URL slug (auto)" className="field" maxLength={60} />
      <textarea name="description" defaultValue={category?.description ?? ""} placeholder="Short description (optional)" rows={2} className="field" maxLength={300} />
      <input name="position" type="number" min={0} defaultValue={category?.position ?? 0} className="field" aria-label="Display order" />
      <div className="flex items-center gap-4">
        <Button type="submit" size="sm" disabled={pending}>{pending ? <Spinner /> : category ? "Save" : "Add category"}</Button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function DeleteCategoryButton({ id, count }: { id: string; count: number }) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => confirm(count ? `Delete this category? Its ${count} products will become uncategorised.` : "Delete this category?") && start(() => deleteCategory(id))}
      className="mt-4 text-xs text-danger hover:underline"
    >
      Delete category
    </button>
  );
}

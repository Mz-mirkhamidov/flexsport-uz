"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import { createCategory, updateCategory } from "@/actions/admin/categories";

type Props = {
  categories: Tables<"categories">[];
  category?: Tables<"categories">;
};

export function CategoryForm({ categories, category }: Props) {
  const action = category
    ? updateCategory.bind(null, category.id)
    : createCategory;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded border border-black/10 p-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Nomi
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={category?.name}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="slug" className="text-sm font-medium">
          Slug (bo&apos;sh qoldirsangiz, nomidan avtomatik yasaladi)
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          defaultValue={category?.slug}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="parentId" className="text-sm font-medium">
          Ota-kategoriya (ixtiyoriy)
        </label>
        <select
          id="parentId"
          name="parentId"
          defaultValue={category?.parent_id ?? ""}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        >
          <option value="">— Top-daraja —</option>
          {categories
            .filter((c) => c.id !== category?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </select>
      </div>
      <div className="flex flex-col gap-1">
        <label htmlFor="sortOrder" className="text-sm font-medium">
          Tartib raqami
        </label>
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={category?.sort_order ?? 0}
          className="w-24 rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.is_active ?? true}
        />
        Faol
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-[#8DC63F] disabled:opacity-60"
      >
        {pending ? "Saqlanmoqda..." : category ? "Saqlash" : "Qo'shish"}
      </button>
    </form>
  );
}

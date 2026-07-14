"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import { createCategory, updateCategory } from "@/actions/admin/categories";
import { FieldGroup, Input, Label, Select } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";

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
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <FieldGroup>
        <Label htmlFor="name">Nomi</Label>
        <Input id="name" name="name" type="text" required defaultValue={category?.name} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="slug">Slug (bo&apos;sh qoldirsangiz, nomidan avtomatik yasaladi)</Label>
        <Input id="slug" name="slug" type="text" defaultValue={category?.slug} />
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="parentId">Ota-kategoriya (ixtiyoriy)</Label>
        <Select id="parentId" name="parentId" defaultValue={category?.parent_id ?? ""}>
          <option value="">— Top-daraja —</option>
          {categories
            .filter((c) => c.id !== category?.id)
            .map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
        </Select>
      </FieldGroup>
      <FieldGroup>
        <Label htmlFor="sortOrder">Tartib raqami</Label>
        <Input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={category?.sort_order ?? 0}
          className="w-24"
        />
      </FieldGroup>
      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={category?.is_active ?? true}
          className="h-4 w-4 rounded border-gray-300 text-[#8DC63F] focus:ring-[#8DC63F]"
        />
        Faol
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saqlanmoqda..." : category ? "Saqlash" : "Qo'shish"}
        </Button>
      </div>
    </form>
  );
}

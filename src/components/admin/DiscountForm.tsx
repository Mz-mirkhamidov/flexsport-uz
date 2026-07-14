"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@/types/database.types";
import { createDiscount } from "@/actions/admin/discounts";
import { FieldGroup, Input, Label, Select } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";

export function DiscountForm({
  categories,
  products,
}: {
  categories: Tables<"categories">[];
  products: Pick<Tables<"products">, "id" | "name">[];
}) {
  const [scope, setScope] = useState<"global" | "category" | "product">("global");
  const [state, formAction, pending] = useActionState(createDiscount, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <FieldGroup>
        <Label>Qamrov</Label>
        <Select
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
        >
          <option value="global">Butun katalog</option>
          <option value="category">Kategoriya</option>
          <option value="product">Mahsulot</option>
        </Select>
      </FieldGroup>

      {scope === "category" && (
        <FieldGroup>
          <Label>Kategoriya</Label>
          <Select name="categoryId" required>
            <option value="">Tanlang</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}

      {scope === "product" && (
        <FieldGroup>
          <Label>Mahsulot</Label>
          <Select name="productId" required>
            <option value="">Tanlang</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </FieldGroup>
      )}

      <FieldGroup>
        <Label>Chegirma foizi</Label>
        <Input name="percent" type="number" min={1} max={100} required className="w-28" />
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Boshlanish</Label>
          <Input name="startsAt" type="datetime-local" required />
        </FieldGroup>
        <FieldGroup>
          <Label>Tugash</Label>
          <Input name="endsAt" type="datetime-local" required />
        </FieldGroup>
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked
          className="h-4 w-4 rounded border-gray-300 text-[#8DC63F] focus:ring-[#8DC63F]"
        />
        Faol
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saqlanmoqda..." : "Skidka qo'shish"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { useActionState, useState } from "react";
import type { Tables } from "@/types/database.types";
import { createDiscount } from "@/actions/admin/discounts";

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
    <form action={formAction} className="flex flex-col gap-3 rounded border border-black/10 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Qamrov</label>
        <select
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value as typeof scope)}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        >
          <option value="global">Butun katalog</option>
          <option value="category">Kategoriya</option>
          <option value="product">Mahsulot</option>
        </select>
      </div>

      {scope === "category" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Kategoriya</label>
          <select
            name="categoryId"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          >
            <option value="">Tanlang</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {scope === "product" && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Mahsulot</label>
          <select
            name="productId"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          >
            <option value="">Tanlang</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Chegirma foizi</label>
        <input
          name="percent"
          type="number"
          min={1}
          max={100}
          required
          className="w-28 rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Boshlanish</label>
          <input
            name="startsAt"
            type="datetime-local"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Tugash</label>
          <input
            name="endsAt"
            type="datetime-local"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isActive" defaultChecked />
        Faol
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-[#8DC63F] disabled:opacity-60"
      >
        {pending ? "Saqlanmoqda..." : "Skidka qo'shish"}
      </button>
    </form>
  );
}

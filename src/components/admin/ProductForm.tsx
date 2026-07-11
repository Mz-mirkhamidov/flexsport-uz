"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import { createProduct, updateProduct } from "@/actions/admin/products";

type Props = {
  categories: Tables<"categories">[];
  product?: Tables<"products"> & { brands: { name: string } | null };
};

export function ProductForm({ categories, product }: Props) {
  const action = product
    ? updateProduct.bind(null, product.id)
    : createProduct;
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-sm font-medium">
            Nomi
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={product?.name}
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="slug" className="text-sm font-medium">
            Slug (ixtiyoriy)
          </label>
          <input
            id="slug"
            name="slug"
            type="text"
            defaultValue={product?.slug}
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Tavsif
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          defaultValue={product?.description ?? ""}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="categoryId" className="text-sm font-medium">
            Kategoriya
          </label>
          <select
            id="categoryId"
            name="categoryId"
            required
            defaultValue={product?.category_id ?? ""}
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          >
            <option value="" disabled>
              Tanlang
            </option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.parent_id ? `— ${c.name}` : c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="brandName" className="text-sm font-medium">
            Brend (ixtiyoriy)
          </label>
          <input
            id="brandName"
            name="brandName"
            type="text"
            defaultValue={product?.brands?.name ?? ""}
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="basePrice" className="text-sm font-medium">
            Narx (so&apos;m)
          </label>
          <input
            id="basePrice"
            name="basePrice"
            type="number"
            step="0.01"
            min={0}
            required
            defaultValue={product?.base_price}
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="discountPct" className="text-sm font-medium">
            Chegirma %
          </label>
          <input
            id="discountPct"
            name="discountPct"
            type="number"
            step="0.01"
            min={0}
            max={100}
            defaultValue={product?.discount_pct ?? ""}
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="lowStockThreshold" className="text-sm font-medium">
            Kam qoldiq chegarasi
          </label>
          <input
            id="lowStockThreshold"
            name="lowStockThreshold"
            type="number"
            min={0}
            defaultValue={product?.low_stock_threshold ?? 5}
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="tags" className="text-sm font-medium">
          Tag&apos;lar (vergul bilan ajrating)
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="masalan: futbol, krossovka, erkaklar"
          defaultValue={product?.tags?.join(", ") ?? ""}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={product?.is_active ?? true}
        />
        Faol (saytda ko&apos;rinadi)
      </label>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-[#8DC63F] disabled:opacity-60"
      >
        {pending ? "Saqlanmoqda..." : product ? "Saqlash" : "Yaratish"}
      </button>
    </form>
  );
}

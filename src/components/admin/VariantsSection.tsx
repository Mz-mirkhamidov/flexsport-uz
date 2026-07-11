"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import {
  addVariant,
  deleteVariant,
  updateVariantStock,
} from "@/actions/admin/products";

type Props = {
  productId: string;
  variants: Tables<"product_variants">[];
};

export function VariantsSection({ productId, variants }: Props) {
  const [state, formAction, pending] = useActionState(
    addVariant.bind(null, productId),
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto rounded border border-black/10">
        <table className="w-full text-sm">
          <thead className="border-b border-black/10 bg-black/5 text-left">
            <tr>
              <th className="px-3 py-2">O&apos;lcham</th>
              <th className="px-3 py-2">Rang</th>
              <th className="px-3 py-2">Narx</th>
              <th className="px-3 py-2">Qoldiq</th>
              <th className="px-3 py-2">SKU</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {variants.map((v) => (
              <tr key={v.id} className="border-b border-black/5">
                <td className="px-3 py-2">{v.size || "—"}</td>
                <td className="px-3 py-2">{v.color || "—"}</td>
                <td className="px-3 py-2">{v.price ?? "—"}</td>
                <td className="px-3 py-2">
                  <form
                    action={updateVariantStock.bind(null, v.id, productId)}
                    className="flex items-center gap-2"
                  >
                    <input
                      type="number"
                      name="stockQty"
                      defaultValue={v.stock_qty}
                      min={0}
                      className="w-20 rounded border border-black/20 px-2 py-1"
                    />
                    <button
                      type="submit"
                      className="text-xs text-black/60 hover:underline"
                    >
                      Yangilash
                    </button>
                  </form>
                </td>
                <td className="px-3 py-2 text-black/50">{v.sku || "—"}</td>
                <td className="px-3 py-2">
                  <form action={deleteVariant.bind(null, v.id, productId)}>
                    <button
                      type="submit"
                      className="text-xs text-red-600 hover:underline"
                    >
                      O&apos;chirish
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {variants.length === 0 && (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-black/50">
                  Variant qo&apos;shilmagan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <form
        action={formAction}
        className="flex flex-wrap items-end gap-3 rounded border border-black/10 p-3"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black/60">O&apos;lcham</label>
          <input
            name="size"
            type="text"
            className="w-24 rounded border border-black/20 px-2 py-1 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black/60">Rang</label>
          <input
            name="color"
            type="text"
            className="w-24 rounded border border-black/20 px-2 py-1 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black/60">Narx (ixtiyoriy)</label>
          <input
            name="price"
            type="number"
            step="0.01"
            min={0}
            className="w-28 rounded border border-black/20 px-2 py-1 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black/60">Qoldiq</label>
          <input
            name="stockQty"
            type="number"
            min={0}
            defaultValue={0}
            className="w-20 rounded border border-black/20 px-2 py-1 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-black/60">SKU</label>
          <input
            name="sku"
            type="text"
            className="w-28 rounded border border-black/20 px-2 py-1 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-[#8DC63F] disabled:opacity-60"
        >
          {pending ? "Qo'shilmoqda..." : "Variant qo'shish"}
        </button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}

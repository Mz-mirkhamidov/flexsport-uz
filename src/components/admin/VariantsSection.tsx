"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import {
  addVariant,
  deleteVariant,
  updateVariantStock,
} from "@/actions/admin/products";
import { TableShell, Th, Td, Tr } from "@/components/admin/ui/Table";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Input } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";

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
      <TableShell>
        <thead>
          <tr>
            <Th>O&apos;lcham</Th>
            <Th>Rang</Th>
            <Th>Narx</Th>
            <Th>Kelish narxi</Th>
            <Th>Qoldiq</Th>
            <Th>SKU</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {variants.map((v) => (
            <Tr key={v.id}>
              <Td>{v.size || "—"}</Td>
              <Td>
                <span className="inline-flex items-center gap-2">
                  {v.color_hex && (
                    <span
                      className="h-4 w-4 rounded-full border border-gray-200"
                      style={{ backgroundColor: v.color_hex }}
                    />
                  )}
                  {v.color || "—"}
                </span>
              </Td>
              <Td>{v.price ?? "—"}</Td>
              <Td>{v.cost_price ?? "—"}</Td>
              <Td>
                <form
                  action={updateVariantStock.bind(null, v.id, productId)}
                  className="flex items-center gap-2"
                >
                  <Input
                    type="number"
                    name="stockQty"
                    defaultValue={v.stock_qty}
                    min={0}
                    className="w-20 py-1"
                  />
                  {v.stock_qty === 0 && <Badge tone="red">Tugagan</Badge>}
                  <button type="submit" className="text-xs font-medium text-gray-500 hover:text-gray-900">
                    Yangilash
                  </button>
                </form>
              </Td>
              <Td className="text-gray-400">{v.sku || "—"}</Td>
              <Td>
                <form action={deleteVariant.bind(null, v.id, productId)}>
                  <button type="submit" className="text-xs font-medium text-red-600 hover:underline">
                    O&apos;chirish
                  </button>
                </form>
              </Td>
            </Tr>
          ))}
          {variants.length === 0 && <EmptyState title="Variant qo'shilmagan" colSpan={7} />}
        </tbody>
      </TableShell>

      <form
        action={formAction}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-4"
      >
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">O&apos;lcham</label>
          <Input name="size" type="text" className="w-24 py-1.5" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Rang</label>
          <Input name="color" type="text" className="w-24 py-1.5" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Rang kodi</label>
          <Input name="colorHex" type="color" defaultValue="#000000" className="h-9 w-14 p-1" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Narx (ixtiyoriy)</label>
          <Input name="price" type="number" step="0.01" min={0} className="w-28 py-1.5" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Qoldiq</label>
          <Input name="stockQty" type="number" min={0} defaultValue={0} className="w-20 py-1.5" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Kelish narxi</label>
          <Input name="costPrice" type="number" step="0.01" min={0} className="w-28 py-1.5" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">SKU</label>
          <Input name="sku" type="text" className="w-28 py-1.5" />
        </div>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Qo'shilmoqda..." : "Variant qo'shish"}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}

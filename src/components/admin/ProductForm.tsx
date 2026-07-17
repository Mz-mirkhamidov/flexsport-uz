"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { Card } from "@/components/admin/ui/Card";
import { Button } from "@/components/admin/ui/Button";
import { FieldGroup, Input, Label, Select, Textarea } from "@/components/admin/ui/Field";

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
    <Card>
      <form action={formAction} className="flex flex-col gap-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="name">Nomi</Label>
            <Input id="name" name="name" type="text" required defaultValue={product?.name} />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="slug">Slug (ixtiyoriy)</Label>
            <Input id="slug" name="slug" type="text" defaultValue={product?.slug} />
          </FieldGroup>
        </div>

        <FieldGroup>
          <Label htmlFor="description">Tavsif</Label>
          <Textarea
            id="description"
            name="description"
            rows={4}
            defaultValue={product?.description ?? ""}
          />
        </FieldGroup>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="categoryId">Kategoriya</Label>
            <Select id="categoryId" name="categoryId" required defaultValue={product?.category_id ?? ""}>
              <option value="" disabled>
                Tanlang
              </option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.parent_id ? `— ${c.name}` : c.name}
                </option>
              ))}
            </Select>
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="brandName">Brend (ixtiyoriy)</Label>
            <Input id="brandName" name="brandName" type="text" defaultValue={product?.brands?.name ?? ""} />
          </FieldGroup>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <FieldGroup>
            <Label htmlFor="basePrice">Narx (so&apos;m)</Label>
            <Input
              id="basePrice"
              name="basePrice"
              type="number"
              step="0.01"
              min={0}
              required
              defaultValue={product?.base_price}
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="discountPct">Chegirma %</Label>
            <Input
              id="discountPct"
              name="discountPct"
              type="number"
              step="0.01"
              min={0}
              max={100}
              defaultValue={product?.discount_pct ?? ""}
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="lowStockThreshold">Kam qoldiq chegarasi</Label>
            <Input
              id="lowStockThreshold"
              name="lowStockThreshold"
              type="number"
              min={0}
              defaultValue={product?.low_stock_threshold ?? 5}
            />
          </FieldGroup>
        </div>

        <FieldGroup>
          <Label htmlFor="tags">Tag&apos;lar (vergul bilan ajrating)</Label>
          <Input
            id="tags"
            name="tags"
            type="text"
            placeholder="masalan: futbol, krossovka, erkaklar"
            defaultValue={product?.tags?.join(", ") ?? ""}
          />
        </FieldGroup>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={product?.is_active ?? true}
            className="h-4 w-4 rounded border-gray-300 text-[#8DC63F] focus:ring-[#8DC63F]"
          />
          Faol (saytda ko&apos;rinadi)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            name="isPremium"
            defaultChecked={product?.tags?.includes("premium-curated") ?? true}
            className="h-4 w-4 rounded border-gray-300 text-[#8DC63F] focus:ring-[#8DC63F]"
          />
          Premium katalog va bosh sahifada ko&apos;rsatish
        </label>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "Saqlanmoqda..." : product ? "Saqlash" : "Yaratish"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

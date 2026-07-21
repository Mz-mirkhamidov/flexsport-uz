"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import { createProduct, updateProduct } from "@/actions/admin/products";
import { Card } from "@/components/admin/ui/Card";
import { Button } from "@/components/admin/ui/Button";
import { FieldGroup, Input, Label, Select, Textarea } from "@/components/admin/ui/Field";
import { PRODUCT_STATUS_OPTIONS } from "@/lib/catalog/product-status";

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
            <Label htmlFor="categoryId">Katalog / mahsulot turi</Label>
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

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="costPrice">Kelish narxi (so&apos;m)</Label>
            <Input
              id="costPrice"
              name="costPrice"
              type="number"
              step="0.01"
              min={0}
              defaultValue={product?.cost_price ?? ""}
              placeholder="Faqat admin ko‘radi"
            />
          </FieldGroup>
          <FieldGroup>
            <Label htmlFor="basePrice">Sotilish narxi (so&apos;m)</Label>
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
          <Label htmlFor="status">Mahsulot holati</Label>
          <Select id="status" name="status" defaultValue={product?.status ?? "draft"}>
            {PRODUCT_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} — {option.description}
              </option>
            ))}
          </Select>
          <p className="text-xs text-gray-500">
            Faol holatni tanlashdan oldin katalog turi, narx va kamida bitta rasmni tekshiring.
          </p>
        </FieldGroup>

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

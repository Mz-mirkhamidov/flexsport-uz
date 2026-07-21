"use client";

import { useActionState, useRef } from "react";
import type { Tables } from "@/types/database.types";
import {
  deleteProductImage,
  uploadProductImage,
} from "@/actions/admin/products";
import { Button } from "@/components/admin/ui/Button";

type Props = {
  productId: string;
  images: Tables<"product_images">[];
  variants: Tables<"product_variants">[];
};

export function ImagesSection({ productId, images, variants }: Props) {
  const colors = Array.from(new Set(variants.map((variant) => variant.color).filter((color): color is string => Boolean(color))));
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, pending] = useActionState(
    async (prevState: { error?: string } | null, formData: FormData) => {
      const result = await uploadProductImage(productId, prevState, formData);
      if (!result?.error) {
        formRef.current?.reset();
      }
      return result;
    },
    null,
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        {images
          .slice()
          .sort((a, b) => a.sort_order - b.sort_order)
          .map((img) => (
            <div
              key={img.id}
              className="group relative h-28 w-28 overflow-hidden rounded-xl border border-gray-200"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt={img.alt_text ?? ""} className="h-full w-full object-cover" />
              {img.alt_text && <span className="absolute left-1.5 top-1.5 rounded-full bg-black/75 px-2 py-0.5 text-[10px] font-semibold text-white">{img.alt_text}</span>}
              <form
                action={deleteProductImage.bind(null, img.id, productId)}
                className="absolute inset-0 flex items-end justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100"
              >
                <button
                  type="submit"
                  className="mb-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-red-600 shadow"
                >
                  O&apos;chirish
                </button>
              </form>
            </div>
          ))}
        {images.length === 0 && (
          <p className="text-sm text-gray-400">Rasm yuklanmagan</p>
        )}
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="flex flex-wrap items-end gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4"
      >
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Mahsulot rasmi<input type="file" name="file" accept="image/*" required className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-[#8DC63F] hover:file:text-gray-900" /></label>
        <label className="flex flex-col gap-1 text-xs font-medium text-gray-600">Qaysi rangga tegishli?
          <select name="imageColor" className="h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900">
            <option value="">Barcha ranglar uchun</option>
            {colors.map((color) => <option key={color} value={color}>{color}</option>)}
          </select>
        </label>
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Yuklanmoqda..." : "Rasm yuklash"}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {colors.length === 0 && <p className="text-xs text-amber-700">Rasmni rangga bog‘lash uchun avval yuqorida rangli variant qo‘shing.</p>}
    </div>
  );
}

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
};

export function ImagesSection({ productId, images }: Props) {
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
        className="flex items-center gap-3 rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4"
      >
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white hover:file:bg-[#8DC63F] hover:file:text-gray-900"
        />
        <Button type="submit" variant="secondary" disabled={pending}>
          {pending ? "Yuklanmoqda..." : "Rasm yuklash"}
        </Button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}

"use client";

import { useActionState, useRef } from "react";
import type { Tables } from "@/types/database.types";
import {
  deleteProductImage,
  uploadProductImage,
} from "@/actions/admin/products";

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
            <div key={img.id} className="flex flex-col items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url}
                alt={img.alt_text ?? ""}
                className="h-28 w-28 rounded border border-black/10 object-cover"
              />
              <form action={deleteProductImage.bind(null, img.id, productId)}>
                <button
                  type="submit"
                  className="text-xs text-red-600 hover:underline"
                >
                  O&apos;chirish
                </button>
              </form>
            </div>
          ))}
        {images.length === 0 && (
          <p className="text-sm text-black/50">Rasm yuklanmagan</p>
        )}
      </div>

      <form
        ref={formRef}
        action={formAction}
        className="flex items-center gap-3 rounded border border-black/10 p-3"
      >
        <input
          type="file"
          name="file"
          accept="image/*"
          required
          className="text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-3 py-1.5 text-sm font-medium text-white hover:bg-[#8DC63F] disabled:opacity-60"
        >
          {pending ? "Yuklanmoqda..." : "Rasm yuklash"}
        </button>
      </form>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
    </div>
  );
}

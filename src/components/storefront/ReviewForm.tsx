"use client";

import { useActionState, useState } from "react";
import { createReview } from "@/actions/reviews";

export function ReviewForm({
  productId,
  productSlug,
}: {
  productId: string;
  productSlug: string;
}) {
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(
    createReview.bind(null, productId, productSlug),
    null,
  );

  if (state?.success) {
    return (
      <p className="rounded border border-[#8DC63F]/40 bg-[#8DC63F]/10 px-4 py-3 text-sm">
        Sharhingiz uchun rahmat! Moderatsiyadan so&apos;ng saytda ko&apos;rinadi.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded border border-black/10 p-4">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setRating(n)}
            className={`text-2xl ${n <= rating ? "text-[#8DC63F]" : "text-black/20"}`}
          >
            ★
          </button>
        ))}
        <input type="hidden" name="rating" value={rating} />
      </div>
      <textarea
        name="text"
        rows={3}
        placeholder="Fikringizni yozing (ixtiyoriy)"
        className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
      />
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-[#8DC63F] disabled:opacity-60"
      >
        {pending ? "Yuborilmoqda..." : "Sharh qoldirish"}
      </button>
    </form>
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { reviewSchema } from "@/lib/validation/reviews";

export type ReviewActionState = { error?: string; success?: boolean } | null;

export async function createReview(
  productId: string,
  productSlug: string,
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Sharh qoldirish uchun tizimga kiring" };
  }

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: user.id,
    rating: parsed.data.rating,
    text: parsed.data.text || null,
  });

  if (error) {
    if (error.code === "23505") {
      return { error: "Siz bu mahsulotga allaqachon sharh qoldirgansiz" };
    }
    return { error: error.message };
  }

  revalidatePath(`/product/${productSlug}`);
  return { success: true };
}

export async function approveReview(reviewId: string) {
  const supabase = await createClient();
  await supabase.from("reviews").update({ is_approved: true }).eq("id", reviewId);
  revalidatePath("/admin/reviews");
}

export async function deleteReview(reviewId: string) {
  const supabase = await createClient();
  await supabase.from("reviews").delete().eq("id", reviewId);
  revalidatePath("/admin/reviews");
}

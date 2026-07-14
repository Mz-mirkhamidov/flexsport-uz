"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleWishlist(productId: string, productSlug: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kirish talab qilinadi" };

  const { data: existing } = await supabase
    .from("wishlist_items")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase.from("wishlist_items").delete().eq("id", existing.id);
  } else {
    await supabase
      .from("wishlist_items")
      .insert({ user_id: user.id, product_id: productId });
  }

  revalidatePath(`/product/${productSlug}`);
  revalidatePath("/account/wishlist");
  return { wishlisted: !existing };
}

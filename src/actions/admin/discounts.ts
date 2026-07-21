"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { discountSchema } from "@/lib/validation/discounts";

export type DiscountActionState = { error?: string } | null;

function parseFormData(formData: FormData) {
  return discountSchema.safeParse({
    scope: formData.get("scope"),
    categoryId: formData.get("categoryId") || undefined,
    productId: formData.get("productId") || undefined,
    percent: formData.get("percent"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    isActive: formData.get("isActive") === "on",
  });
}

export async function createDiscount(
  _prevState: DiscountActionState,
  formData: FormData,
): Promise<DiscountActionState> {
  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("discounts").insert({
    scope: parsed.data.scope,
    category_id: parsed.data.scope === "category" ? parsed.data.categoryId : null,
    product_id: parsed.data.scope === "product" ? parsed.data.productId : null,
    percent: parsed.data.percent,
    starts_at: new Date(parsed.data.startsAt).toISOString(),
    ends_at: new Date(parsed.data.endsAt).toISOString(),
    is_active: parsed.data.isActive,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/discounts");
  return null;
}

export async function deleteDiscount(discountId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("discounts").delete().eq("id", discountId);
  revalidatePath("/admin/discounts");
}

export async function toggleDiscountActive(discountId: string, isActive: boolean) {
  const { supabase } = await requireAdmin();
  await supabase.from("discounts").update({ is_active: !isActive }).eq("id", discountId);
  revalidatePath("/admin/discounts");
}

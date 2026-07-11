import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

export async function getActiveDiscounts(
  supabase: SupabaseClient<Database>,
) {
  const nowIso = new Date().toISOString();
  const { data } = await supabase
    .from("discounts")
    .select("scope, category_id, product_id, percent")
    .eq("is_active", true)
    .lte("starts_at", nowIso)
    .gte("ends_at", nowIso);
  return data ?? [];
}

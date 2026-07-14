import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getActiveDiscounts } from "@/lib/catalog/discounts";
import { resolveEffectivePrice } from "@/lib/pricing/effective-price";
import type { ProductListItem } from "@/lib/catalog/query";

function mapProduct(
  p: {
    id: string;
    slug: string;
    name: string;
    base_price: number;
    discount_pct: number | null;
    category_id: string;
    brands: { name: string } | null;
    product_images: { url: string; sort_order: number }[];
  },
  activeDiscounts: Awaited<ReturnType<typeof getActiveDiscounts>>,
): ProductListItem {
  const effective = resolveEffectivePrice(
    Number(p.base_price),
    p.discount_pct !== null ? Number(p.discount_pct) : null,
    p.category_id,
    activeDiscounts,
    p.id,
  );
  const sortedImages = [...(p.product_images ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order,
  );
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: sortedImages[0]?.url ?? null,
    brand: p.brands?.name ?? null,
    price: effective.price,
    originalPrice: effective.originalPrice,
    discountPercent: effective.discountPercent,
    hasStock: true,
    lowStock: false,
  };
}

export async function getNewArrivals(
  supabase: SupabaseClient<Database>,
  limit = 8,
) {
  const [{ data: products }, activeDiscounts] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, base_price, discount_pct, category_id, brands(name), product_images(url, sort_order)",
      )
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(limit),
    getActiveDiscounts(supabase),
  ]);
  return (products ?? []).map((p) => mapProduct(p, activeDiscounts));
}

export async function getOnSale(supabase: SupabaseClient<Database>, limit = 8) {
  const [{ data: products }, activeDiscounts] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, base_price, discount_pct, category_id, brands(name), product_images(url, sort_order)",
      )
      .eq("is_active", true)
      .not("discount_pct", "is", null)
      .order("created_at", { ascending: false })
      .limit(limit),
    getActiveDiscounts(supabase),
  ]);
  return (products ?? []).map((p) => mapProduct(p, activeDiscounts));
}

export async function getBestsellers(
  supabase: SupabaseClient<Database>,
  limit = 8,
) {
  const thirtyDaysAgo = new Date(
    Date.now() - 30 * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: recentItems } = await supabase
    .from("order_items")
    .select("product_id, qty, orders!inner(status, product_payment_status, created_at)")
    .neq("orders.status", "cancelled")
    .eq("orders.product_payment_status", "paid")
    .gte("orders.created_at", thirtyDaysAgo);

  if (!recentItems || recentItems.length === 0) {
    return getNewArrivals(supabase, limit);
  }

  const salesByProduct = new Map<string, number>();
  for (const item of recentItems) {
    salesByProduct.set(
      item.product_id,
      (salesByProduct.get(item.product_id) ?? 0) + item.qty,
    );
  }
  const topProductIds = [...salesByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  const [{ data: products }, activeDiscounts] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id, slug, name, base_price, discount_pct, category_id, brands(name), product_images(url, sort_order)",
      )
      .eq("is_active", true)
      .in("id", topProductIds),
    getActiveDiscounts(supabase),
  ]);

  const ordered = topProductIds
    .map((id) => products?.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  return ordered.map((p) => mapProduct(p, activeDiscounts));
}

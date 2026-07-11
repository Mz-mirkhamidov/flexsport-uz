import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getActiveDiscounts } from "@/lib/catalog/discounts";
import { resolveEffectivePrice } from "@/lib/pricing/effective-price";

export type ProductListItem = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  brand: string | null;
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  hasStock: boolean;
};

export type ProductListFilters = {
  categoryIds?: string[];
  brandSlugs?: string[];
  minPrice?: number;
  maxPrice?: number;
  sizes?: string[];
  colors?: string[];
  onSaleOnly?: boolean;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: "newest" | "price_asc" | "price_desc";
};

export async function getCategoryIdsForSlug(
  supabase: SupabaseClient<Database>,
  categorySlug: string,
  subcategorySlug?: string,
) {
  const { data: category } = await supabase
    .from("categories")
    .select("id")
    .eq("slug", categorySlug)
    .single();
  if (!category) return [];

  if (subcategorySlug) {
    const { data: sub } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", subcategorySlug)
      .eq("parent_id", category.id)
      .single();
    return sub ? [sub.id] : [];
  }

  const { data: children } = await supabase
    .from("categories")
    .select("id")
    .eq("parent_id", category.id);

  return [category.id, ...(children ?? []).map((c) => c.id)];
}

export type CatalogFilterOptions = {
  brands: { name: string; slug: string }[];
  sizes: string[];
  colors: string[];
};

export async function getFilterOptions(
  supabase: SupabaseClient<Database>,
  categoryIds: string[],
): Promise<CatalogFilterOptions> {
  if (categoryIds.length === 0) {
    return { brands: [], sizes: [], colors: [] };
  }

  const { data: products } = await supabase
    .from("products")
    .select("id, brands(name, slug)")
    .eq("is_active", true)
    .in("category_id", categoryIds);

  const productIds = (products ?? []).map((p) => p.id);
  const brandMap = new Map<string, { name: string; slug: string }>();
  for (const p of products ?? []) {
    if (p.brands) brandMap.set(p.brands.slug, p.brands);
  }

  let sizes: string[] = [];
  let colors: string[] = [];
  if (productIds.length > 0) {
    const { data: variants } = await supabase
      .from("product_variants")
      .select("size, color")
      .in("product_id", productIds);
    sizes = [...new Set((variants ?? []).map((v) => v.size).filter(Boolean))] as string[];
    colors = [...new Set((variants ?? []).map((v) => v.color).filter(Boolean))] as string[];
  }

  return { brands: [...brandMap.values()], sizes, colors };
}

export async function queryProducts(
  supabase: SupabaseClient<Database>,
  filters: ProductListFilters,
): Promise<{ items: ProductListItem[]; total: number }> {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;

  let brandIds: string[] | undefined;
  if (filters.brandSlugs?.length) {
    const { data } = await supabase
      .from("brands")
      .select("id")
      .in("slug", filters.brandSlugs);
    brandIds = (data ?? []).map((b) => b.id);
  }

  let variantProductIds: string[] | undefined;
  if (filters.sizes?.length || filters.colors?.length) {
    let variantQuery = supabase.from("product_variants").select("product_id");
    if (filters.sizes?.length) variantQuery = variantQuery.in("size", filters.sizes);
    if (filters.colors?.length) variantQuery = variantQuery.in("color", filters.colors);
    const { data } = await variantQuery;
    variantProductIds = [...new Set((data ?? []).map((v) => v.product_id))];
  }

  let query = supabase
    .from("products")
    .select(
      "id, slug, name, base_price, discount_pct, category_id, brands(name), product_images(url, sort_order), product_variants(stock_qty)",
      { count: "exact" },
    )
    .eq("is_active", true);

  if (filters.categoryIds?.length) {
    query = query.in("category_id", filters.categoryIds);
  }
  if (brandIds) {
    query = brandIds.length ? query.in("brand_id", brandIds) : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }
  if (variantProductIds) {
    query = variantProductIds.length
      ? query.in("id", variantProductIds)
      : query.eq("id", "00000000-0000-0000-0000-000000000000");
  }
  if (filters.minPrice !== undefined) query = query.gte("base_price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("base_price", filters.maxPrice);
  if (filters.onSaleOnly) query = query.not("discount_pct", "is", null);
  if (filters.search) {
    const term = filters.search.trim();
    if (term) {
      query = query.or(`name.ilike.%${term}%,tags.cs.{${term}}`);
    }
  }

  switch (filters.sort) {
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    default:
      query = query.order("created_at", { ascending: false });
  }

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const [{ data: products, count }, activeDiscounts] = await Promise.all([
    query,
    getActiveDiscounts(supabase),
  ]);

  const items: ProductListItem[] = (products ?? []).map((p) => {
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
      hasStock: (p.product_variants ?? []).some((v) => v.stock_qty > 0),
    };
  });

  return { items, total: count ?? 0 };
}

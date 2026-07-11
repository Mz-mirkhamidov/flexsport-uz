import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getCategoryIdsForSlug,
  getFilterOptions,
  queryProducts,
  type ProductListFilters,
} from "@/lib/catalog/query";
import { ProductCard } from "@/components/storefront/ProductCard";
import { CatalogFilters } from "@/components/storefront/CatalogFilters";

type SearchParams = Record<string, string | string[] | undefined>;

function toArray(value: string | string[] | undefined) {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

const PAGE_SIZE = 24;

export async function CatalogListing({
  categorySlug,
  subcategorySlug,
  searchParams,
}: {
  categorySlug: string;
  subcategorySlug?: string;
  searchParams: SearchParams;
}) {
  const supabase = await createClient();

  const { data: category } = await supabase
    .from("categories")
    .select("id, name, slug")
    .eq("slug", categorySlug)
    .single();
  if (!category) notFound();

  let activeCategory = category;
  if (subcategorySlug) {
    const { data: sub } = await supabase
      .from("categories")
      .select("id, name, slug")
      .eq("slug", subcategorySlug)
      .eq("parent_id", category.id)
      .single();
    if (!sub) notFound();
    activeCategory = sub;
  }

  const { data: subcategories } = subcategorySlug
    ? { data: null }
    : await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("parent_id", category.id)
        .eq("is_active", true)
        .order("sort_order");

  const categoryIds = await getCategoryIdsForSlug(
    supabase,
    categorySlug,
    subcategorySlug,
  );

  const page = Number(toArray(searchParams.page)[0]) || 1;
  const sort = toArray(searchParams.sort)[0] as
    | ProductListFilters["sort"]
    | undefined;
  const minPrice = toArray(searchParams.minPrice)[0];
  const maxPrice = toArray(searchParams.maxPrice)[0];
  const brand = toArray(searchParams.brand);
  const size = toArray(searchParams.size);
  const color = toArray(searchParams.color);
  const onSale = toArray(searchParams.onSale)[0];

  const [{ items, total }, filterOptions] = await Promise.all([
    queryProducts(supabase, {
      categoryIds,
      brandSlugs: brand,
      sizes: size,
      colors: color,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      onSaleOnly: onSale === "1",
      sort,
      page,
      pageSize: PAGE_SIZE,
    }),
    getFilterOptions(supabase, categoryIds),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const basePath = subcategorySlug
    ? `/catalog/${categorySlug}/${subcategorySlug}`
    : `/catalog/${categorySlug}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="text-2xl font-bold">{activeCategory.name}</h1>

      {subcategories && subcategories.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {subcategories.map((s) => (
            <Link
              key={s.id}
              href={`/catalog/${categorySlug}/${s.slug}`}
              className="rounded-full border border-black/10 px-3 py-1 text-sm hover:border-[#8DC63F] hover:text-[#8DC63F]"
            >
              {s.name}
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <CatalogFilters
          basePath={basePath}
          options={filterOptions}
          selected={{ minPrice, maxPrice, brand, size, color, onSale, sort }}
        />

        <div>
          <p className="mb-4 text-sm text-black/50">{total} ta mahsulot</p>
          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {items.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <p className="text-black/50">Mahsulot topilmadi</p>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 text-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`${basePath}?${new URLSearchParams({
                    ...(minPrice ? { minPrice } : {}),
                    ...(maxPrice ? { maxPrice } : {}),
                    ...(sort ? { sort } : {}),
                    page: String(p),
                  }).toString()}`}
                  className={`rounded px-3 py-1 ${
                    p === page
                      ? "bg-black text-white"
                      : "border border-black/10 hover:border-[#8DC63F]"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { CatalogListing } from "@/components/storefront/CatalogListing";

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string; subcategorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { categorySlug, subcategorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <CatalogListing
      categorySlug={categorySlug}
      subcategorySlug={subcategorySlug}
      searchParams={resolvedSearchParams}
    />
  );
}

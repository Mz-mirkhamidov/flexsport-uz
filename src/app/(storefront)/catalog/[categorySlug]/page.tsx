import { CatalogListing } from "@/components/storefront/CatalogListing";

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  return (
    <CatalogListing
      categorySlug={categorySlug}
      searchParams={resolvedSearchParams}
    />
  );
}

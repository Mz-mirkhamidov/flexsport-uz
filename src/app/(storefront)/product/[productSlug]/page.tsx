import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveDiscounts } from "@/lib/catalog/discounts";
import { resolveEffectivePrice } from "@/lib/pricing/effective-price";
import { queryProducts } from "@/lib/catalog/query";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ productSlug: string }>;
}) {
  const { productSlug } = await params;
  const supabase = await createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*, product_variants(*), product_images(*)")
    .eq("slug", productSlug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  const activeDiscounts = await getActiveDiscounts(supabase);
  const effective = resolveEffectivePrice(
    Number(product.base_price),
    product.discount_pct !== null ? Number(product.discount_pct) : null,
    product.category_id,
    activeDiscounts,
    product.id,
  );

  const { items: related } = await queryProducts(supabase, {
    categoryIds: [product.category_id],
    pageSize: 5,
  });
  const relatedFiltered = related.filter((p) => p.id !== product.id).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ProductDetail
        product={product}
        variants={product.product_variants}
        images={product.product_images}
        price={effective.price}
        originalPrice={effective.originalPrice}
        discountPercent={effective.discountPercent}
      />

      <section className="mt-16">
        <h2 className="mb-4 text-lg font-bold">Sharhlar</h2>
        <p className="text-sm text-black/50">
          Hozircha sharhlar yo&apos;q.
        </p>
      </section>

      {relatedFiltered.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-4 text-lg font-bold">O&apos;xshash mahsulotlar</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {relatedFiltered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

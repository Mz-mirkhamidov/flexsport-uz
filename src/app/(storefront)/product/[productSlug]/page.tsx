import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveDiscounts } from "@/lib/catalog/discounts";
import { resolveEffectivePrice } from "@/lib/pricing/effective-price";
import { queryProducts } from "@/lib/catalog/query";
import { ProductDetail } from "@/components/storefront/ProductDetail";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ReviewForm } from "@/components/storefront/ReviewForm";

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
    .in("status", ["active", "hidden"])
    .single();

  if (!product) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

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

  const [{ data: reviews }, wishlistCheck, ownReviewCheck] = await Promise.all([
    supabase
      .from("reviews")
      .select("id, rating, text, created_at, profiles(full_name)")
      .eq("product_id", product.id)
      .eq("is_approved", true)
      .order("created_at", { ascending: false }),
    user
      ? supabase
          .from("wishlist_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from("reviews")
          .select("id")
          .eq("user_id", user.id)
          .eq("product_id", product.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const avgRating =
    reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <ProductDetail
        product={product}
        variants={product.product_variants}
        images={product.product_images}
        price={effective.price}
        originalPrice={effective.originalPrice}
        discountPercent={effective.discountPercent}
        isWishlisted={Boolean(wishlistCheck.data)}
        isLoggedIn={Boolean(user)}
      />

      <section className="mt-16 max-w-2xl">
        <h2 className="mb-4 text-lg font-bold">
          Sharhlar {avgRating && `— ★ ${avgRating.toFixed(1)} (${reviews!.length})`}
        </h2>

        <div className="mb-6 flex flex-col gap-4">
          {reviews && reviews.length > 0 ? (
            reviews.map((r) => (
              <div key={r.id} className="rounded border border-black/10 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {r.profiles?.full_name ?? "Mijoz"}
                  </span>
                  <span className="text-[#8DC63F]">{"★".repeat(r.rating)}</span>
                </div>
                {r.text && <p className="mt-1 text-sm text-black/70">{r.text}</p>}
              </div>
            ))
          ) : (
            <p className="text-sm text-black/50">Hozircha sharhlar yo&apos;q.</p>
          )}
        </div>

        {user ? (
          ownReviewCheck.data ? (
            <p className="text-sm text-black/50">
              Siz bu mahsulotga sharh qoldirgansiz.
            </p>
          ) : (
            <ReviewForm productId={product.id} productSlug={product.slug} />
          )
        ) : (
          <p className="text-sm text-black/50">
            Sharh qoldirish uchun tizimga kiring.
          </p>
        )}
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

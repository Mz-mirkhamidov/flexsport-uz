import { createClient } from "@/lib/supabase/server";
import { getActiveDiscounts } from "@/lib/catalog/discounts";
import { resolveEffectivePrice } from "@/lib/pricing/effective-price";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function AccountWishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("wishlist_items")
    .select(
      "product_id, products(id, slug, name, base_price, discount_pct, category_id, is_active, brands(name), product_images(url, sort_order))",
    )
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const activeDiscounts = await getActiveDiscounts(supabase);

  const products = (items ?? [])
    .map((i) => i.products)
    .filter((p): p is NonNullable<typeof p> => Boolean(p) && p.is_active)
    .map((p) => {
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
      };
    });

  return (
    <div>
      <h1 className="text-2xl font-bold">Sevimlilar</h1>
      {products.length === 0 ? (
        <p className="mt-4 text-black/60">Sevimlilar ro&apos;yxati bo&apos;sh.</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

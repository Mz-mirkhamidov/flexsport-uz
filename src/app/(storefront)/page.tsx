import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBestsellers, getNewArrivals, getOnSale } from "@/lib/catalog/highlights";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { ProductListItem } from "@/lib/catalog/query";

export const revalidate = 3600;

function ProductRow({
  title,
  products,
}: {
  title: string;
  products: ProductListItem[];
}) {
  if (products.length === 0) return null;
  return (
    <section className="mx-auto max-w-6xl px-4 py-10">
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: categories }, newArrivals, bestsellers, onSale] =
    await Promise.all([
      supabase
        .from("categories")
        .select("id, name, slug")
        .is("parent_id", null)
        .eq("is_active", true)
        .order("sort_order"),
      getNewArrivals(supabase),
      getBestsellers(supabase),
      getOnSale(supabase),
    ]);

  return (
    <>
      <section className="bg-black text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-20">
          <h1 className="text-3xl font-bold">
            FLEX<span className="text-[#8DC63F]">SPORT</span>.UZ
          </h1>
          <p className="max-w-xl text-white/70">
            Barcha turdagi sport mahsulotlari — bir joyda, qulay va tez
            yetkazib berish bilan.
          </p>
        </div>
      </section>

      {categories && categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/catalog/${c.slug}`}
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium hover:border-[#8DC63F] hover:text-[#8DC63F]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductRow title="Yangi kelganlar" products={newArrivals} />
      <ProductRow title="Ko'p sotilganlar" products={bestsellers} />
      <ProductRow title="Chegirmadagilar" products={onSale} />
    </>
  );
}

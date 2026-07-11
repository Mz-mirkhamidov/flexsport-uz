import { createClient } from "@/lib/supabase/server";
import { queryProducts } from "@/lib/catalog/query";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;
  const supabase = await createClient();

  const { items, total } = q
    ? await queryProducts(supabase, {
        search: q,
        page: page ? Number(page) : 1,
        pageSize: 24,
      })
    : { items: [], total: 0 };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <form method="get" action="/search" className="mb-8 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Mahsulot nomi yoki tegini qidiring..."
          className="flex-1 rounded border border-black/20 px-4 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
        <button
          type="submit"
          className="rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-[#8DC63F]"
        >
          Qidirish
        </button>
      </form>

      {q && (
        <p className="mb-4 text-sm text-black/50">
          &quot;{q}&quot; bo&apos;yicha {total} ta natija
        </p>
      )}

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : q ? (
        <p className="text-black/50">Hech narsa topilmadi</p>
      ) : null}
    </div>
  );
}

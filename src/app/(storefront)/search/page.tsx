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
    <div className="search-page">
      <div className="catalog-title"><span>TEZ TOPING</span><h1>Qidiruv</h1><p>Mahsulot nomi, sport turi yoki brend bo‘yicha qidiring</p></div>
      <form method="get" action="/search" className="search-form">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Mahsulot nomi yoki tegini qidiring..."
          enterKeyHint="search"
          className="search-input"
        />
        <button
          type="submit"
          className="search-button"
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
        <div className="product-grid">
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

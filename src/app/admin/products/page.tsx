import Link from "next/link";
import { Package, Plus } from "@phosphor-icons/react/dist/ssr";
import { AdminStorefrontChrome } from "@/components/admin/AdminStorefrontChrome";
import { CuratedProductCard } from "@/components/storefront/CuratedProductCard";
import { getCuratedProducts } from "@/lib/catalog/curated-query";
import { createClient } from "@/lib/supabase/server";
import type { CuratedProduct } from "@/lib/catalog/curated-products";

const PAGE_SIZE = 24;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: "active" | "archived"; page?: string }>;
}) {
  const { q = "", status = "active", page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);
  const supabase = await createClient();

  const [{ count: activeCount }, { count: archivedCount }] = await Promise.all([
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("products").select("id", { count: "exact", head: true }).eq("status", "archived"),
  ]);

  let products: Array<CuratedProduct & { id?: string }> = [];
  let total = activeCount ?? 0;

  if (status === "archived") {
    let query = supabase
      .from("products")
      .select("id, slug, name, description, base_price, product_images(url, sort_order)", { count: "exact" })
      .eq("status", "archived")
      .order("created_at", { ascending: false });
    if (q) query = query.ilike("name", `%${q}%`);
    const from = (page - 1) * PAGE_SIZE;
    const { data, count } = await query.range(from, from + PAGE_SIZE - 1);
    total = count ?? 0;
    products = (data ?? []).map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description ?? "Arxivdagi mahsulot",
      kicker: "Arxiv",
      category: "anjom",
      price: product.base_price,
      image: [...product.product_images].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? "/catalog/ball-match-black.webp",
      badge: "Arxiv",
    }));
  } else {
    const liveProducts = await getCuratedProducts();
    const needle = q.trim().toLocaleLowerCase("uz");
    products = liveProducts.filter((product) => !needle || `${product.name} ${product.kicker}`.toLocaleLowerCase("uz").includes(needle));
    total = products.length;
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminStorefrontChrome>
      <div className="catalog-discovery admin-catalog-workspace">
        <section className="admin-catalog-hero">
          <div><span>ADMIN KATALOG</span><h1>Mahsulotlarni<br /><em>ko‘rinishda boshqaring.</em></h1><p>Mehmon ko‘radigan kartani ko‘ring va ustidagi tahrirlash tugmasidan o‘zgartiring.</p></div>
          <Link href="/admin/products/new" className="admin-new-product"><Plus weight="bold" /> Yangi mahsulot</Link>
        </section>

        <form method="get" action="/admin/products" className="catalog-search">
          <input type="hidden" name="status" value={status} />
          <input name="q" defaultValue={q} placeholder="Mahsulot nomini qidiring" />
          <button>Qidirish</button>
        </form>

        <nav className="catalog-category-chips admin-status-tabs" aria-label="Mahsulot holatlari">
          <Link href="/admin/products" className={status === "active" ? "active" : ""}>Faol <small>{activeCount ?? 0}</small></Link>
          <Link href="/admin/products?status=archived" className={status === "archived" ? "active" : ""}>Arxiv <small>{archivedCount ?? 0}</small></Link>
        </nav>

        <div className="catalog-results-head"><div><span>VIZUAL KATALOG</span><h2>{status === "archived" ? "Arxivdagi mahsulotlar" : "Saytda ko‘rinadigan mahsulotlar"}</h2></div><strong>{total}</strong></div>

        {products.length ? (
          <div className="curated-catalog-grid">
            {products.map((product, index) => (
              <CuratedProductCard
                key={product.id ?? product.slug}
                product={product}
                priority={index < 4}
                adminEditHref={product.id ? `/admin/products/${product.id}/edit` : "/admin/products/new"}
              />
            ))}
          </div>
        ) : (
          <div className="catalog-empty"><Package /><h2>Mahsulot topilmadi</h2><p>Qidiruvni o‘zgartirib ko‘ring.</p></div>
        )}

        {status === "archived" && totalPages > 1 && (
          <div className="admin-catalog-pagination">
            {Array.from({ length: totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), page + 2).map((pageNumber) => (
              <Link key={pageNumber} href={`/admin/products?status=archived&page=${pageNumber}${q ? `&q=${encodeURIComponent(q)}` : ""}`} className={pageNumber === page ? "active" : ""}>{pageNumber}</Link>
            ))}
          </div>
        )}
      </div>
    </AdminStorefrontChrome>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getBestsellers, getNewArrivals, getOnSale } from "@/lib/catalog/highlights";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { ProductListItem } from "@/lib/catalog/query";

export const revalidate = 3600;

const categoryIcons = ["⚽", "🏀", "🏋️", "🏃", "🎾", "🏊", "⛺", "🚲", "👕", "🎒"];

function Arrow() {
  return <span aria-hidden="true">↗</span>;
}

function ProductRow({ title, eyebrow, products, href = "/search" }: { title: string; eyebrow: string; products: ProductListItem[]; href?: string }) {
  if (products.length === 0) return null;
  return (
    <section className="store-section">
      <div className="section-heading">
        <div><p>{eyebrow}</p><h2>{title}</h2></div>
        <Link href={href}>Barchasini ko‘rish <Arrow /></Link>
      </div>
      <div className="product-grid">
        {products.map((product, index) => <ProductCard key={product.id} product={product} priority={index < 4} />)}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, newArrivals, bestsellers, onSale] = await Promise.all([
    supabase.from("categories").select("id, name, slug").is("parent_id", null).eq("is_active", true).order("sort_order"),
    getNewArrivals(supabase), getBestsellers(supabase), getOnSale(supabase),
  ]);

  return (
    <>
      <section className="hero">
        <div className="hero-glow" />
        <div className="hero-inner">
          <div className="hero-copy">
            <span className="hero-kicker"><i /> SPORT. HARAKAT. NATIJA.</span>
            <h1>O‘zingizning<br /><em>eng kuchli</em><br />versiyangiz.</h1>
            <p>Professional sport inventarlari, kiyimlar va aksessuarlar. O‘zbekiston bo‘ylab tez yetkazib beramiz.</p>
            <div className="hero-actions">
              <Link href="/search" className="primary-cta">Mahsulotlarni ko‘rish <Arrow /></Link>
              <Link href="#categories" className="secondary-cta">Kategoriyalar ↓</Link>
            </div>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="hero-number">01</div>
            <div className="orbit orbit-one" /><div className="orbit orbit-two" />
            <div className="sport-mark">F<span>S</span></div>
            <div className="hero-caption"><b>10+</b><span>sport yo‘nalishi</span></div>
          </div>
        </div>
      </section>

      <section className="benefits" aria-label="Afzalliklar">
        <div><b>✓</b><span><strong>Sifat kafolati</strong><small>Sinovdan o‘tgan mahsulotlar</small></span></div>
        <div><b>↗</b><span><strong>Tez yetkazib berish</strong><small>Toshkent bo‘ylab 1 kunda</small></span></div>
        <div><b>↺</b><span><strong>Oson qaytarish</strong><small>14 kun ichida almashtirish</small></span></div>
        <div><b>◎</b><span><strong>Yordam kerakmi?</strong><small>Mutaxassis maslahati</small></span></div>
      </section>

      {categories && categories.length > 0 && (
        <section className="store-section categories" id="categories">
          <div className="section-heading"><div><p>YO‘NALISHINGIZNI TANLANG</p><h2>Sport kategoriyalari</h2></div></div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <Link key={category.id} href={`/catalog/${category.slug}`}>
                <span className="category-icon">{categoryIcons[index % categoryIcons.length]}</span>
                <strong>{category.name}</strong><small>Mahsulotlarni ko‘rish</small><i>→</i>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductRow eyebrow="HOZIRGINA QO‘SHILDI" title="Yangi kelganlar" products={newArrivals} />
      <section className="campaign">
        <div><span>FLEXSPORT CLUB</span><h2>Harakatni<br />bugun boshlang.</h2><p>Sport — bu xarid emas, bu o‘zingizga kiritilgan sarmoya.</p><Link href="/search">Katalogga o‘tish <Arrow /></Link></div>
        <div className="campaign-word" aria-hidden="true">MOVE</div>
      </section>
      <ProductRow eyebrow="MIJOZLAR TANLOVI" title="Ko‘p sotilganlar" products={bestsellers} />
      <ProductRow eyebrow="FOYDALI NARXLAR" title="Chegirmadagi mahsulotlar" products={onSale} />
    </>
  );
}

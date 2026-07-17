import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getBestsellers, getNewArrivals, getOnSale } from "@/lib/catalog/highlights";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { ProductListItem } from "@/lib/catalog/query";
import { getCategoryIdsForSlug, queryProducts } from "@/lib/catalog/query";

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

type Collection = { title: string; subtitle: string; href: string; image: string | null; tone: string };
function CollectionGrid({ collections }: { collections: Collection[] }) {
  return <section className="store-section curated"><div className="section-heading"><div><p>MEDAL EMAS — BUTUN SPORT OLAMI</p><h2>Maqsadingiz bo‘yicha tanlang</h2></div></div><div className="collection-grid">
    {collections.map((item, index) => <Link href={item.href} className={`collection-card ${item.tone}`} key={item.title}>
      {item.image && <Image src={item.image} alt="" fill sizes="(max-width:600px) 85vw, 40vw" className="collection-image" />}
      <span className="collection-index">0{index + 1}</span><div className="collection-overlay" /><div className="collection-copy"><small>{item.subtitle}</small><h3>{item.title}</h3><b>Tanlash →</b></div>
    </Link>)}
  </div></section>;
}

export default async function HomePage() {
  const supabase = await createClient();
  const [{ data: categories }, newArrivals, bestsellers, onSale, footballIds, fitnessIds, cyclingIds, tennisIds] = await Promise.all([
    supabase.from("categories").select("id, name, slug").is("parent_id", null).eq("is_active", true).order("sort_order"),
    getNewArrivals(supabase), getBestsellers(supabase), getOnSale(supabase),
    getCategoryIdsForSlug(supabase, "futbol"), getCategoryIdsForSlug(supabase, "fitnes-trenajyor"), getCategoryIdsForSlug(supabase, "velosport"), getCategoryIdsForSlug(supabase, "tennis"),
  ]);

  const [football, fitness, cycling, tennis] = await Promise.all([
    queryProducts(supabase, { categoryIds: footballIds, pageSize: 8 }),
    queryProducts(supabase, { categoryIds: fitnessIds, pageSize: 8 }),
    queryProducts(supabase, { categoryIds: cyclingIds, pageSize: 4 }),
    queryProducts(supabase, { categoryIds: tennisIds, pageSize: 4 }),
  ]);
  const diverse = [football.items[0], fitness.items[0], cycling.items[0], tennis.items[0], football.items[1], fitness.items[1], cycling.items[1], tennis.items[1]].filter(Boolean) as ProductListItem[];
  const nonMedalBestsellers = bestsellers.filter((item) => !item.slug.includes("medal"));
  const curatedBestsellers = nonMedalBestsellers.length >= 4 ? nonMedalBestsellers : diverse;
  const curatedSale = onSale.filter((item) => !item.slug.includes("medal"));
  const collections: Collection[] = [
    { title: "Futbol formasi va butsalar", subtitle: "MAYDONGA TAYYOR", href: "/catalog/futbol", image: football.items[0]?.image ?? null, tone: "collection-dark" },
    { title: "Uy uchun fitness", subtitle: "KUCH VA NATIJA", href: "/catalog/fitnes-trenajyor", image: fitness.items[0]?.image ?? null, tone: "collection-lime" },
    { title: "Velosiped va samokat", subtitle: "HARAKAT ERKINLIGI", href: "/catalog/velosport", image: cycling.items[0]?.image ?? null, tone: "collection-blue" },
    { title: "Tennis va raketkalar", subtitle: "ANIQLIK VA TEZLIK", href: "/catalog/tennis", image: tennis.items[0]?.image ?? null, tone: "collection-sand" },
  ];

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

      <CollectionGrid collections={collections} />
      <ProductRow eyebrow="FLEXSPORT TANLOVI" title="Hozir trendda" products={diverse.length ? diverse : newArrivals} />
      <section className="campaign">
        <div><span>FLEXSPORT CLUB</span><h2>Harakatni<br />bugun boshlang.</h2><p>Sport — bu xarid emas, bu o‘zingizga kiritilgan sarmoya.</p><Link href="/search">Katalogga o‘tish <Arrow /></Link></div>
        <div className="campaign-word" aria-hidden="true">MOVE</div>
      </section>
      <ProductRow eyebrow="FUTBOL UCHUN HAMMASI" title="Maydonga tayyor" products={football.items.slice(0, 8)} href="/catalog/futbol" />
      <ProductRow eyebrow="KUCHLI BO‘LING" title="Fitness va trenajyorlar" products={fitness.items.slice(0, 8)} href="/catalog/fitnes-trenajyor" />
      <ProductRow eyebrow="MIJOZLAR TANLOVI" title="Ko‘p sotilganlar" products={curatedBestsellers} />
      <ProductRow eyebrow="FOYDALI NARXLAR" title="Chegirmadagi mahsulotlar" products={curatedSale} />
    </>
  );
}

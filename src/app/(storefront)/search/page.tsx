import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, MagnifyingGlass, Package, SoccerBall } from "@phosphor-icons/react/dist/ssr";
import { CuratedProductCard } from "@/components/storefront/CuratedProductCard";
import { categoryLabels, curatedProducts, formatUzs, type CuratedCategory } from "@/lib/catalog/curated-products";

const categories = Object.entries(categoryLabels) as [CuratedCategory, string][];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; product?: string }> }) {
  const { q = "", category, product } = await searchParams;
  const selected = curatedProducts.find((item) => item.slug === product);
  const needle = q.trim().toLocaleLowerCase("uz");
  const items = curatedProducts.filter((item) => {
    const inCategory = !category || category === "all" || item.category === category;
    const inSearch = !needle || `${item.name} ${item.kicker} ${categoryLabels[item.category]}`.toLocaleLowerCase("uz").includes(needle);
    return inCategory && inSearch;
  });

  if (selected) return <div className="catalog-discovery product-focus">
    <Link href="/search" className="catalog-back"><ArrowLeft /> Katalogga qaytish</Link>
    <section className="curated-product-feature">
      <div className="curated-product-visual"><Image src={selected.image} alt={selected.name} fill priority sizes="(max-width:700px) 100vw, 55vw" /></div>
      <div className="curated-product-details"><small>{selected.kicker}</small><h1>{selected.name}</h1><p>{selected.description}</p><strong>{formatUzs(selected.price)}</strong><Link href="/contact">Buyurtma berish <ArrowRight weight="bold" /></Link><span>1–3 kunda yetkazib berish · 14 kun ichida qaytarish</span></div>
    </section>
  </div>;

  return <div className="catalog-discovery">
    <section className="catalog-hero">
      <div><span>FLEXSPORT / 01</span><h1>O‘YININGNI<br/><em>TANLA.</em></h1><p>Bir xil premium uslubdagi saralangan futbol, fitness va sport kolleksiyasi.</p></div>
      <div className="catalog-hero-stat"><strong>20</strong><span>yangi<br/>model</span><SoccerBall /></div>
    </section>
    <form method="get" action="/search" className="catalog-search"><MagnifyingGlass/><input name="q" defaultValue={q} placeholder="Butsa, forma yoki anjom qidiring"/><button>Qidirish</button></form>
    <nav className="catalog-category-chips" aria-label="Mahsulot kategoriyalari">
      <Link href="/search" className={!category ? "active" : ""}>Hammasi <small>20</small></Link>
      {categories.map(([key,label]) => <Link href={`/search?category=${key}`} className={category === key ? "active" : ""} key={key}>{label}<small>{curatedProducts.filter(p=>p.category===key).length}</small></Link>)}
    </nav>
    <div className="catalog-results-head"><div><span>SARALANGAN KOLLEKSIYA</span><h2>{category && categoryLabels[category as CuratedCategory] || (q ? `“${q}” natijalari` : "Barcha mahsulotlar")}</h2></div><strong>{items.length.toString().padStart(2,"0")}</strong></div>
    {items.length ? <div className="curated-catalog-grid">{items.map((item,index)=><CuratedProductCard product={item} priority={index<4} key={item.slug}/>)}</div> : <div className="catalog-empty"><Package/><h2>Bu yer hozircha bo‘sh</h2><p>Boshqa so‘z bilan qidiring yoki to‘liq kolleksiyaga qayting.</p><Link href="/search">20 ta mahsulotni ko‘rish</Link></div>}
  </div>;
}

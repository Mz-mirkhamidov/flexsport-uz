import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Barbell, BoxingGlove, CheckCircle, ClockCounterClockwise, PersonSimpleRun, ShieldCheck, SoccerBall, Truck } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { getBestsellers, getNewArrivals } from "@/lib/catalog/highlights";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { ProductListItem } from "@/lib/catalog/query";
import { getCategoryIdsForSlug, queryProducts } from "@/lib/catalog/query";

export const revalidate = 3600;

const quickSports = [
  { label: "Futbol", href: "/catalog/futbol", Icon: SoccerBall },
  { label: "Fitness", href: "/catalog/fitnes-trenajyor", Icon: Barbell },
  { label: "Yugurish", href: "/search?q=yugurish", Icon: PersonSimpleRun },
  { label: "Boks", href: "/search?q=boks", Icon: BoxingGlove },
];

function ProductRow({ title, products, href = "/search" }: { title: string; products: ProductListItem[]; href?: string }) {
  if (!products.length) return null;
  return (
    <section className="premium-section">
      <div className="premium-heading">
        <h2>{title}</h2>
        <Link href={href}>Barchasini ko‘rish <ArrowRight weight="bold" /></Link>
      </div>
      <div className="premium-products">
        {products.slice(0, 8).map((product, index) => <ProductCard key={product.id} product={product} priority={index < 2} />)}
      </div>
    </section>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const [newArrivals, bestsellers, footballIds, fitnessIds] = await Promise.all([
    getNewArrivals(supabase),
    getBestsellers(supabase),
    getCategoryIdsForSlug(supabase, "futbol"),
    getCategoryIdsForSlug(supabase, "fitnes-trenajyor"),
  ]);
  const [football, fitness] = await Promise.all([
    queryProducts(supabase, { categoryIds: footballIds, pageSize: 8 }),
    queryProducts(supabase, { categoryIds: fitnessIds, pageSize: 8 }),
  ]);
  const mixed = [football.items[0], fitness.items[0], football.items[1], fitness.items[1], ...newArrivals]
    .filter((item): item is ProductListItem => Boolean(item) && !item.slug.includes("medal"));
  const featured = mixed[0];
  const popular = bestsellers.filter((item) => !item.slug.includes("medal"));

  return (
    <div className="premium-home">
      <section className="premium-hero">
        <Image src="/flexsport-hero-athletes.webp" alt="FlexSport sportchilari" fill priority sizes="100vw" className="premium-hero-image" />
        <div className="premium-hero-shade" />
        <div className="premium-hero-copy">
          <p>Cheksiz kuch.</p>
          <h1>Sening<br />o‘yining.</h1>
          <span>Chegaralarni yeng.<br />O‘z maqsadingga erish.</span>
          <Link href="/search">Yangiliklarni ko‘rish <ArrowRight weight="bold" /></Link>
        </div>
      </section>

      <section className="premium-trust" aria-label="Do‘kon afzalliklari">
        <div><Truck /><span><strong>Tez yetkazib berish</strong><small>1–3 kun ichida</small></span></div>
        <div><ShieldCheck /><span><strong>100% original</strong><small>Kafolatlangan sifat</small></span></div>
        <div><ClockCounterClockwise /><span><strong>14 kun ichida</strong><small>Oson qaytarish</small></span></div>
      </section>

      <nav className="sport-pills" aria-label="Sport turlari">
        {quickSports.map(({ label, href, Icon }, index) => (
          <Link href={href} key={label} className={index === 0 ? "active" : ""}><Icon weight="regular" /><span>{label}</span></Link>
        ))}
      </nav>

      {featured && (
        <section className="premium-section">
          <div className="premium-heading"><h2>Yangi mahsulotlar</h2><Link href="/search">Barchasini ko‘rish <ArrowRight weight="bold" /></Link></div>
          <Link href={`/product/${featured.slug}`} className="featured-drop">
            <div className="featured-copy"><small>Yangi</small><h3>{featured.name}</h3><p>Yengil. Mustahkam. Chegarasiz harakat.</p><strong>{new Intl.NumberFormat("uz-UZ").format(featured.price)} UZS</strong><span>Hozir sotib olish <ArrowRight weight="bold" /></span></div>
            {featured.image ? <Image src={featured.image} alt={featured.name} fill sizes="(max-width:600px) 100vw, 50vw" /> : <div className="feature-fallback">FS</div>}
          </Link>
        </section>
      )}

      <ProductRow title="Eng ko‘p sotilgan" products={popular.length ? popular : mixed} />
      <section className="premium-manifesto">
        <div><CheckCircle weight="fill" /><span>FlexSport tanlovi</span></div>
        <h2>Sportni boshlash uchun<br /><em>ertani kutmang.</em></h2>
        <Link href="/search">Katalogni ochish <ArrowRight weight="bold" /></Link>
      </section>
      <ProductRow title="Futbol uchun" products={football.items.filter((item) => !item.slug.includes("medal"))} href="/catalog/futbol" />
      <ProductRow title="Fitness uchun" products={fitness.items.filter((item) => !item.slug.includes("medal"))} href="/catalog/fitnes-trenajyor" />
    </div>
  );
}

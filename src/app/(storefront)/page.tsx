import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Barbell, BoxingGlove, ClockCounterClockwise, Heart, PersonSimpleRun, ShieldCheck, ShoppingCartSimple, SoccerBall, Truck } from "@phosphor-icons/react/dist/ssr";
import { CuratedProductCard } from "@/components/storefront/CuratedProductCard";
import { curatedProducts } from "@/lib/catalog/curated-products";
import { getCuratedProducts } from "@/lib/catalog/curated-query";
import { createClient } from "@/lib/supabase/server";
import { resolveHomepageContent } from "@/lib/cms/homepage";

export const revalidate = 3600;

const quickSports = [
  { label: "Futbol", href: "/search?category=butsa", Icon: SoccerBall },
  { label: "Fitness", href: "/search?category=fitness", Icon: Barbell },
  { label: "Yugurish", href: "/search?q=yugurish", Icon: PersonSimpleRun },
  { label: "Boks", href: "/search?q=boks", Icon: BoxingGlove },
];

const showcaseProducts = [
  { name: "FS Phantom Pro FG", type: "Professional futbol butsasi", price: "1 199 000 UZS", image: "/fs-boots.webp", href: "/search?q=butsa", badge: "Bestseller" },
  { name: "FS Undeniable 60L", type: "Sport sumkasi va ryukzak", price: "699 000 UZS", image: "/fs-bag.webp", href: "/search?q=sumka", badge: "Yangi" },
  { name: "FS Pro Compression", type: "Erkaklar uchun termo kiyim", price: "479 000 UZS", image: "/fs-compression.webp", href: "/search?q=kiyim", badge: "Yangi" },
  { name: "FS Elite Match Ball", type: "Professional futbol to‘pi", price: "389 000 UZS", image: "/fs-football.webp", href: "/search?q=to‘p", badge: "Top" },
];

function ShowcaseCard({ product, priority = false }: { product: (typeof showcaseProducts)[number]; priority?: boolean }) {
  return <article className="showcase-card">
    <Link href={product.href} className="showcase-image">
      <Image src={product.image} alt={product.name} fill sizes="(max-width:700px) 50vw, 25vw" priority={priority} />
      <span className="showcase-badge">{product.badge}</span>
      <span className="showcase-heart"><Heart /></span>
    </Link>
    <div className="showcase-info"><small>{product.type}</small><Link href={product.href}>{product.name}</Link><div><strong>{product.price}</strong><Link href={product.href} aria-label={`${product.name}ni ko‘rish`}><ShoppingCartSimple weight="bold" /></Link></div></div>
  </article>;
}

function ProductRow({ title, products, href = "/search", adminMode = false }: { title: string; products: typeof curatedProducts; href?: string; adminMode?: boolean }) {
  return (
    <section className={`premium-section ${adminMode ? "admin-editable-section" : ""}`}>
      {adminMode && <Link href="/admin/products" className="admin-section-edit">Tahrirlash</Link>}
      <div className="premium-heading">
        <h2>{title}</h2>
        <Link href={href}>Barchasini ko‘rish <ArrowRight weight="bold" /></Link>
      </div>
      <div className="premium-products">
        {products.slice(0, 4).map((product, index) => <CuratedProductCard key={product.slug} product={product} priority={index < 2} />)}
      </div>
    </section>
  );
}

function MultilineText({ value }: { value: string }) {
  return value.split("\n").map((line, index) => (
    <span key={`${line}-${index}`}>
      {index > 0 && <br />}
      {line}
    </span>
  ));
}

function EmphasizedLastWord({ value }: { value: string }) {
  const words = value.trim().split(/\s+/);
  const lastWord = words.pop() ?? "";
  return <>{words.join(" ")}<br /><em>{lastWord}</em></>;
}

export async function PremiumHome({ adminMode = false }: { adminMode?: boolean }) {
  const supabase = await createClient();
  const [{ data: page }, liveProducts] = await Promise.all([
    supabase.from("site_pages").select("id").eq("slug", "homepage").eq("status", "published").maybeSingle(),
    getCuratedProducts(),
  ]);
  const { data: sections } = page
    ? await supabase
        .from("site_sections")
        .select("section_key, published_content")
        .eq("page_id", page.id)
        .eq("is_visible", true)
    : { data: null };
  const content = resolveHomepageContent(sections);

  return (
    <div className="premium-home">
      <section className={`premium-hero ${adminMode ? "admin-editable-section" : ""}`}>
        {adminMode && <Link href="/admin/storefront/edit#hero" className="admin-section-edit">Tahrirlash</Link>}
        <Image src={content.hero.imageUrl} alt={content.hero.imageAlt} fill priority sizes="100vw" className="premium-hero-image" />
        <div className="premium-hero-shade" />
        <div className="premium-hero-copy">
          <p><MultilineText value={content.hero.titleTop} /></p>
          <h1><MultilineText value={content.hero.titleAccent} /></h1>
          <span><MultilineText value={content.hero.subtitle} /></span>
          <Link href={content.hero.ctaHref}>{content.hero.ctaLabel} <ArrowRight weight="bold" /></Link>
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

      <section className={`premium-section ${adminMode ? "admin-editable-section" : ""}`}>
        {adminMode && <Link href="/admin/storefront/edit#featured-campaign" className="admin-section-edit">Tahrirlash</Link>}
        <div className="premium-heading"><h2>Yangi mahsulotlar</h2><Link href={content.featuredCampaign.ctaHref}>Barchasini ko‘rish <ArrowRight weight="bold" /></Link></div>
        <Link href={content.featuredCampaign.ctaHref} className="featured-drop">
          <Image src={content.featuredCampaign.imageUrl} alt={content.featuredCampaign.imageAlt} fill sizes="(max-width:700px) 100vw, 70vw" priority />
          <div className="featured-copy"><small>{content.featuredCampaign.eyebrow}</small><h3>{content.featuredCampaign.heading}</h3><p>{content.featuredCampaign.description}</p><strong>{content.featuredCampaign.priceLabel}</strong><span>{content.featuredCampaign.ctaLabel} <ArrowRight weight="bold" /></span></div>
        </Link>
      </section>

      <section className={`premium-section curated-showcase ${adminMode ? "admin-editable-section" : ""}`}>
        {adminMode && <Link href="/admin/products" className="admin-section-edit">Tahrirlash</Link>}
        <div className="premium-heading"><h2>Eng ko‘p sotilgan</h2><Link href="/search">Barchasini ko‘rish <ArrowRight weight="bold" /></Link></div>
        <div className="showcase-grid">{showcaseProducts.map((product, index) => <ShowcaseCard product={product} priority={index < 2} key={product.name} />)}</div>
      </section>

      <section className={`sport-finder ${adminMode ? "admin-editable-section" : ""}`}>
        {adminMode && <Link href="/admin/storefront/edit#sport-finder" className="admin-section-edit">Tahrirlash</Link>}
        <div className="sport-finder-copy"><span>{content.sportFinder.eyebrow}</span><h2><EmphasizedLastWord value={content.sportFinder.heading} /></h2><p>{content.sportFinder.description}</p></div>
        <div className="sport-finder-links">
          <Link href="/search?category=butsa"><small>01 / MAYDON</small><strong>Tezlik va nazorat</strong><ArrowRight/></Link>
          <Link href="/search?category=fitness"><small>02 / KUCH</small><strong>Fitness va trening</strong><ArrowRight/></Link>
          <Link href="/search?category=sumka"><small>03 / HARAKAT</small><strong>Kiyim va sumkalar</strong><ArrowRight/></Link>
        </div>
      </section>
      <ProductRow adminMode={adminMode} title="Futbol uchun" products={liveProducts.filter((item) => ["butsa","forma","top","anjom"].includes(item.category))} href="/search?category=butsa" />
      <ProductRow adminMode={adminMode} title="Fitness va harakat" products={liveProducts.filter((item) => ["fitness","sumka"].includes(item.category))} href="/search?category=fitness" />
    </div>
  );
}

export default function HomePage() {
  return <PremiumHome />;
}

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "@phosphor-icons/react/dist/ssr";
import { CuratedProduct, formatUzs } from "@/lib/catalog/curated-products";

export function CuratedProductCard({ product, priority = false }: { product: CuratedProduct; priority?: boolean }) {
  return <article className="curated-card">
    <Link href={`/search?product=${product.slug}`} className="curated-card-image">
      <Image src={product.image} alt={product.name} fill sizes="(max-width:700px) 48vw, 25vw" priority={priority} />
      {product.badge && <span className="showcase-badge">{product.badge}</span>}
      <span className="showcase-heart"><Heart /></span>
    </Link>
    <div className="curated-card-copy">
      <small>{product.kicker}</small>
      <Link href={`/search?product=${product.slug}`}>{product.name}</Link>
      <div><strong>{formatUzs(product.price)}</strong><Link href={`/search?product=${product.slug}`} aria-label={`${product.name} haqida`}><ArrowUpRight weight="bold" /></Link></div>
    </div>
  </article>;
}

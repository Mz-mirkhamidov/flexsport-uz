import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/lib/catalog/query";

function formatPrice(value: number) { return new Intl.NumberFormat("uz-UZ").format(value) + " so‘m"; }

export function ProductCard({ product, priority = false }: { product: ProductListItem; priority?: boolean }) {
  return (
    <article className="product-card">
      <Link href={`/product/${product.slug}`} className="product-image" aria-label={product.name}>
        {product.image ? <Image src={product.image} alt={product.name} fill sizes="(max-width: 640px) 50vw, 25vw" className="object-contain" priority={priority} /> : <div className="product-placeholder"><span>FS</span><small>Mahsulot rasmi</small></div>}
        <div className="product-badges">
          {product.discountPercent ? <span className="discount">−{product.discountPercent}%</span> : null}
          {product.hasStock && product.lowStock ? <span className="low-stock">Kam qoldi</span> : null}
          {!product.hasStock ? <span className="sold-out">Tugagan</span> : null}
        </div>
        <span className="quick-view">Ko‘rib chiqish →</span>
      </Link>
      <div className="product-info">
        <div className="product-meta"><span>{product.brand ?? "FLEXSPORT"}</span><span>★ 4.9</span></div>
        <Link href={`/product/${product.slug}`} className="product-name">{product.name}</Link>
        <div className="product-price"><strong>{formatPrice(product.price)}</strong>{product.originalPrice ? <del>{formatPrice(product.originalPrice)}</del> : null}</div>
      </div>
    </article>
  );
}

import Image from "next/image";
import Link from "next/link";
import type { ProductListItem } from "@/lib/catalog/query";

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <Link
      href={`/product/${product.slug}`}
      className="group flex flex-col gap-2"
    >
      <div className="relative aspect-square overflow-hidden rounded bg-black/5">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 50vw, 25vw"
            className="object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-black/30">
            Rasm yo&apos;q
          </div>
        )}
        {product.discountPercent && (
          <span className="absolute left-2 top-2 rounded bg-[#8DC63F] px-2 py-0.5 text-xs font-semibold text-black">
            -{product.discountPercent}%
          </span>
        )}
        {!product.hasStock && (
          <span className="absolute right-2 top-2 rounded bg-black/70 px-2 py-0.5 text-xs text-white">
            Tugagan
          </span>
        )}
      </div>
      <div className="flex flex-col">
        {product.brand && (
          <span className="text-xs uppercase text-black/40">
            {product.brand}
          </span>
        )}
        <span className="text-sm font-medium leading-snug">
          {product.name}
        </span>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-sm font-semibold">
            {formatPrice(product.price)}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-black/40 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

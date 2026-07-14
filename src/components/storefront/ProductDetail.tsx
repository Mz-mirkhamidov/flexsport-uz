"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { Tables } from "@/types/database.types";
import { addToCart } from "@/lib/cart/store";
import { WishlistButton } from "@/components/storefront/WishlistButton";

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

type Props = {
  product: Tables<"products">;
  variants: Tables<"product_variants">[];
  images: Tables<"product_images">[];
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
  isWishlisted: boolean;
  isLoggedIn: boolean;
};

export function ProductDetail({
  product,
  variants,
  images,
  price,
  originalPrice,
  discountPercent,
  isWishlisted,
  isLoggedIn,
}: Props) {
  const sortedImages = useMemo(
    () => [...images].sort((a, b) => a.sort_order - b.sort_order),
    [images],
  );
  const [activeImage, setActiveImage] = useState(0);
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants.find((v) => v.stock_qty > 0)?.id ?? variants[0]?.id ?? "",
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariant = variants.find((v) => v.id === selectedVariantId);
  const outOfStock = !selectedVariant || selectedVariant.stock_qty === 0;

  function handleAddToCart() {
    if (!selectedVariant || outOfStock) return;
    addToCart(
      {
        variantId: selectedVariant.id,
        productId: product.id,
        productSlug: product.slug,
        name: product.name,
        variantLabel: [selectedVariant.size, selectedVariant.color]
          .filter(Boolean)
          .join(" / ") || null,
        price: selectedVariant.price ?? price,
        image: sortedImages[0]?.url ?? null,
        maxStock: selectedVariant.stock_qty,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <div className="relative aspect-square overflow-hidden rounded bg-black/5">
          {sortedImages[activeImage] ? (
            <Image
              src={sortedImages[activeImage].url}
              alt={product.name}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-black/30">
              Rasm yo&apos;q
            </div>
          )}
        </div>
        {sortedImages.length > 1 && (
          <div className="flex gap-2">
            {sortedImages.map((img, i) => (
              <button
                key={img.id}
                onClick={() => setActiveImage(i)}
                className={`relative h-16 w-16 overflow-hidden rounded border ${
                  i === activeImage ? "border-[#8DC63F]" : "border-black/10"
                }`}
              >
                <Image src={img.url} alt="" fill className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold">{product.name}</h1>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold">{formatPrice(price)}</span>
          {originalPrice && (
            <>
              <span className="text-black/40 line-through">
                {formatPrice(originalPrice)}
              </span>
              <span className="rounded bg-[#8DC63F] px-2 py-0.5 text-xs font-semibold text-black">
                -{discountPercent}%
              </span>
            </>
          )}
        </div>

        {product.description && (
          <p className="text-sm leading-relaxed text-black/70">
            {product.description}
          </p>
        )}

        {variants.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold">Variant tanlang</span>
            <div className="flex flex-wrap gap-2">
              {variants.map((v) => {
                const label =
                  [v.size, v.color].filter(Boolean).join(" / ") || "Standart";
                const isSelected = v.id === selectedVariantId;
                const isOut = v.stock_qty === 0;
                return (
                  <button
                    key={v.id}
                    disabled={isOut}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`rounded border px-3 py-1.5 text-sm ${
                      isSelected
                        ? "border-[#8DC63F] bg-[#8DC63F]/10"
                        : "border-black/20"
                    } ${isOut ? "cursor-not-allowed opacity-40 line-through" : ""}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
            {selectedVariant && (
              <span className="text-xs text-black/50">
                {selectedVariant.stock_qty > 0
                  ? `Omborda: ${selectedVariant.stock_qty} dona`
                  : "Tugagan"}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={selectedVariant?.stock_qty ?? 1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            className="w-20 rounded border border-black/20 px-3 py-2 text-sm"
          />
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="flex-1 rounded bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-[#8DC63F] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {outOfStock
              ? "Tugagan"
              : added
                ? "Qo'shildi ✓"
                : "Savatga qo'shish"}
          </button>
        </div>

        <WishlistButton
          productId={product.id}
          productSlug={product.slug}
          initialWishlisted={isWishlisted}
          isLoggedIn={isLoggedIn}
        />

        {product.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-black/5 px-3 py-1 text-xs text-black/60"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

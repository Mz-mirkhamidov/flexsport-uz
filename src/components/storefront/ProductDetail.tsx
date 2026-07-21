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
  const selectedColor = selectedVariant?.color?.trim().toLocaleLowerCase("uz") ?? "";
  const visibleImages = useMemo(() => {
    if (!selectedColor) return sortedImages;
    const matching = sortedImages.filter((image) => image.alt_text?.trim().toLocaleLowerCase("uz") === selectedColor);
    return matching.length ? matching : sortedImages;
  }, [selectedColor, sortedImages]);
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
        image: visibleImages[0]?.url ?? null,
        maxStock: selectedVariant.stock_qty,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="product-detail-grid">
      <div className="flex flex-col gap-3">
        <div className="product-gallery-main">
          {visibleImages[activeImage] ? (
            <Image
              src={visibleImages[activeImage].url}
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
        {visibleImages.length > 1 && (
          <div className="flex gap-2">
            {visibleImages.map((img, i) => (
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

      <div className="product-detail-copy">
        <div className="product-detail-kicker">FLEXSPORT • ORIGINAL MAHSULOT</div>
        <h1>{product.name}</h1>

        <div className="product-detail-price">
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
          <p className="product-description">
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
                    onClick={() => { setSelectedVariantId(v.id); setActiveImage(0); }}
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

        <div className="product-buy-row">
          <input
            type="number"
            min={1}
            max={selectedVariant?.stock_qty ?? 1}
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
            aria-label="Mahsulot soni"
            className="product-qty"
          />
          <button
            onClick={handleAddToCart}
            disabled={outOfStock}
            className="product-add-button"
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

        <div className="product-trust">
          <div><b>✓</b><span><strong>Sifat kafolati</strong><small>Tekshirilgan mahsulot</small></span></div>
          <div><b>↗</b><span><strong>Tez yetkazish</strong><small>1–3 ish kuni</small></span></div>
          <div><b>↺</b><span><strong>Oson qaytarish</strong><small>14 kun ichida</small></span></div>
        </div>

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

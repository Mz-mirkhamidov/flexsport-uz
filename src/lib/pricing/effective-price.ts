import type { Tables } from "@/types/database.types";

export type EffectivePrice = {
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
};

/**
 * Resolves the price actually charged for a product, given its own manual
 * discount_pct plus any active time-bounded discounts. Most specific scope
 * wins: product > category > global.
 */
export function resolveEffectivePrice(
  basePrice: number,
  productDiscountPct: number | null,
  categoryId: string,
  activeDiscounts: Pick<
    Tables<"discounts">,
    "scope" | "category_id" | "product_id" | "percent"
  >[],
  productId?: string,
): EffectivePrice {
  const productDiscount = productId
    ? activeDiscounts.find(
        (d) => d.scope === "product" && d.product_id === productId,
      )
    : undefined;
  const categoryDiscount = activeDiscounts.find(
    (d) => d.scope === "category" && d.category_id === categoryId,
  );
  const globalDiscount = activeDiscounts.find((d) => d.scope === "global");

  const percent =
    productDiscount?.percent ??
    categoryDiscount?.percent ??
    globalDiscount?.percent ??
    productDiscountPct ??
    null;

  if (!percent) {
    return { price: basePrice, originalPrice: null, discountPercent: null };
  }

  const price = Math.round(basePrice * (1 - percent / 100));
  return { price, originalPrice: basePrice, discountPercent: percent };
}

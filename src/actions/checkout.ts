"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getActiveDiscounts } from "@/lib/catalog/discounts";
import { resolveEffectivePrice } from "@/lib/pricing/effective-price";
import { createPaymeCheckoutUrl } from "@/lib/payme/client";
import { sendTelegramMessage } from "@/lib/telegram/bot";
import { newOrderPaidMessage } from "@/lib/telegram/templates";

export type CheckoutItem = { variantId: string; qty: number };
export type CheckoutResult = { error?: string; checkoutUrl?: string; orderId?: string };

export async function createOrder(
  addressId: string,
  items: CheckoutItem[],
): Promise<CheckoutResult> {
  if (items.length === 0) return { error: "Savat bo'sh" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kirish talab qilinadi" };

  const { data: address } = await supabase
    .from("addresses")
    .select("*, delivery_zones(*)")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();
  if (!address || !address.delivery_zones) {
    return { error: "Manzil topilmadi" };
  }

  const activeDiscounts = await getActiveDiscounts(supabase);

  const orderItems: {
    product_id: string;
    variant_id: string;
    product_name_snapshot: string;
    variant_label_snapshot: string | null;
    unit_price: number;
    qty: number;
  }[] = [];

  for (const item of items) {
    const { data: variant } = await supabase
      .from("product_variants")
      .select("*, products(*)")
      .eq("id", item.variantId)
      .single();
    if (!variant || !variant.products) {
      return { error: "Mahsulot topilmadi" };
    }
    if (variant.stock_qty < item.qty) {
      return { error: `"${variant.products.name}" uchun omborda yetarli mahsulot yo'q` };
    }

    const effective = resolveEffectivePrice(
      Number(variant.products.base_price),
      variant.products.discount_pct !== null ? Number(variant.products.discount_pct) : null,
      variant.products.category_id,
      activeDiscounts,
      variant.products.id,
    );
    const unitPrice = variant.price ?? effective.price;

    orderItems.push({
      product_id: variant.products.id,
      variant_id: variant.id,
      product_name_snapshot: variant.products.name,
      variant_label_snapshot:
        [variant.size, variant.color].filter(Boolean).join(" / ") || null,
      unit_price: unitPrice,
      qty: item.qty,
    });
  }

  const productAmount = orderItems.reduce((sum, i) => sum + i.unit_price * i.qty, 0);
  const deliveryFeeAmount = Number(address.delivery_zones.fee);

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      address_id: address.id,
      ship_full_name: address.full_name,
      ship_phone: address.phone,
      ship_region: address.region,
      ship_city: address.city,
      ship_address_line: address.address_line,
      delivery_method: address.delivery_zones.method,
      delivery_zone_id: address.delivery_zones.id,
      product_amount: productAmount,
      delivery_fee_amount: deliveryFeeAmount,
    })
    .select("id, order_number")
    .single();
  if (orderError || !order) {
    return { error: orderError?.message ?? "Buyurtma yaratilmadi" };
  }

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(orderItems.map((i) => ({ ...i, order_id: order.id })));
  if (itemsError) {
    return { error: itemsError.message };
  }

  const returnUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?order=${order.id}`;
  const checkoutUrl = createPaymeCheckoutUrl({
    orderId: order.id,
    amountSom: productAmount,
    returnUrl,
  });

  return {
    orderId: order.id,
    checkoutUrl: checkoutUrl ?? `/checkout/mock-pay?order=${order.id}`,
  };
}

/**
 * Dev-only: simulates a successful Payme PerformTransaction when no real
 * merchant is configured yet, so the full flow can be exercised end to end.
 */
export async function mockCompletePayment(orderId: string): Promise<{ error?: string }> {
  if (process.env.PAYME_MERCHANT_ID) {
    return { error: "Payme sozlangan — mock to'lov o'chirilgan" };
  }

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .update({ product_payment_status: "paid" })
    .eq("id", orderId)
    .select("*, order_items(*)")
    .single();
  if (!order) return { error: "Buyurtma topilmadi" };

  await admin.from("payment_transactions").insert({
    order_id: orderId,
    provider: "payme",
    provider_transaction_id: `mock-${orderId}`,
    amount: order.product_amount,
    state: "performed",
    performed_at: new Date().toISOString(),
    raw_payload: { mock: true },
  });

  for (const item of order.order_items) {
    const { data: variant } = await admin
      .from("product_variants")
      .select("stock_qty")
      .eq("id", item.variant_id)
      .single();
    if (variant) {
      await admin
        .from("product_variants")
        .update({ stock_qty: Math.max(0, variant.stock_qty - item.qty) })
        .eq("id", item.variant_id);
    }
  }

  await sendTelegramMessage(newOrderPaidMessage(order));

  return {};
}

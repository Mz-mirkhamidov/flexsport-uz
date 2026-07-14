import type { Tables } from "@/types/database.types";

function formatSom(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export function newOrderPaidMessage(
  order: Tables<"orders"> & { order_items: Tables<"order_items">[] },
) {
  const lines = order.order_items
    .map((i) => `• ${i.product_name_snapshot}${i.variant_label_snapshot ? ` (${i.variant_label_snapshot})` : ""} × ${i.qty}`)
    .join("\n");

  return [
    `<b>✅ Yangi buyurtma to'landi</b>`,
    `№ ${order.order_number}`,
    ``,
    `👤 ${order.ship_full_name}`,
    `📞 ${order.ship_phone}`,
    `📍 ${order.ship_region}, ${order.ship_city}, ${order.ship_address_line}`,
    ``,
    lines,
    ``,
    `Mahsulot: ${formatSom(Number(order.product_amount))} (Payme orqali to'landi)`,
    `Yetkazib berish: ${formatSom(Number(order.delivery_fee_amount))} (yetkazganda naqd olinadi)`,
  ].join("\n");
}

export function lowStockMessage(productName: string, variantLabel: string | null, stockQty: number) {
  return [
    `<b>⚠️ Kam qoldiq</b>`,
    `${productName}${variantLabel ? ` (${variantLabel})` : ""}`,
    `Qoldiq: ${stockQty} dona`,
  ].join("\n");
}

export function orderStatusChangedMessage(orderNumber: string, status: string) {
  const labels: Record<string, string> = {
    received: "Qabul qilindi",
    preparing: "Tayyorlanmoqda",
    in_transit: "Yo'lda",
    delivered: "Yetkazildi",
    cancelled: "Bekor qilindi",
  };
  return `<b>Buyurtma holati o'zgardi</b>\n№ ${orderNumber}: ${labels[status] ?? status}`;
}

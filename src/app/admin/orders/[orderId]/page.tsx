import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  advanceOrderStatus,
  cancelOrder,
  markDeliveryFeeCollected,
} from "@/actions/admin/orders";

const STATUS_LABELS: Record<string, string> = {
  received: "Qabul qilindi",
  preparing: "Tayyorlanmoqda",
  in_transit: "Yo'lda",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

const NEXT_LABEL: Record<string, string> = {
  received: "Tayyorlanmoqdaga o'tkazish",
  preparing: "Yo'ldaga o'tkazish",
  in_transit: "Yetkazildiga o'tkazish",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*), order_status_history(*)")
    .eq("id", orderId)
    .single();

  if (!order) notFound();

  const canAdvance = NEXT_LABEL[order.status];
  const canCancel = order.status !== "delivered" && order.status !== "cancelled";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Buyurtma № {order.order_number}</h1>
          <p className="text-black/50">
            {new Date(order.created_at).toLocaleString("uz-UZ")}
          </p>
        </div>
        <div className="flex gap-2">
          {canAdvance && (
            <form action={advanceOrderStatus.bind(null, order.id)}>
              <button
                type="submit"
                className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-[#8DC63F]"
              >
                {NEXT_LABEL[order.status]}
              </button>
            </form>
          )}
          {canCancel && (
            <form action={cancelOrder.bind(null, order.id)}>
              <button
                type="submit"
                className="rounded border border-red-600 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Bekor qilish
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="rounded border border-black/10 p-4 text-sm">
        <p className="font-semibold">{STATUS_LABELS[order.status] ?? order.status}</p>
        <p className="mt-2 text-black/60">
          {order.ship_full_name}, {order.ship_phone}
        </p>
        <p className="text-black/60">
          {order.ship_region}, {order.ship_city}, {order.ship_address_line}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {order.order_items.map((item) => (
          <div key={item.id} className="flex justify-between rounded border border-black/10 p-3 text-sm">
            <span>
              {item.product_name_snapshot}
              {item.variant_label_snapshot && ` (${item.variant_label_snapshot})`} × {item.qty}
            </span>
            <span>{formatPrice(item.line_total ?? item.unit_price * item.qty)}</span>
          </div>
        ))}
      </div>

      <div className="rounded border border-black/10 p-4 text-sm">
        <div className="flex items-center justify-between">
          <span>Mahsulot (Payme)</span>
          <span>
            {formatPrice(Number(order.product_amount))} —{" "}
            {order.product_payment_status === "paid" ? "to'landi ✅" : "kutilmoqda ⏳"}
          </span>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <span>Yetkazib berish (naqd)</span>
          <div className="flex items-center gap-2">
            <span>
              {formatPrice(Number(order.delivery_fee_amount))} —{" "}
              {order.delivery_fee_payment_status === "collected" ? "olindi ✅" : "kutilmoqda ⏳"}
            </span>
            {order.delivery_fee_payment_status !== "collected" && (
              <form action={markDeliveryFeeCollected.bind(null, order.id)}>
                <button type="submit" className="text-xs text-[#8DC63F] hover:underline">
                  Olindi deb belgilash
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-2 flex justify-between border-t border-black/10 pt-2 font-bold">
          <span>Jami</span>
          <span>{formatPrice(Number(order.total_amount))}</span>
        </div>
      </div>

      {order.order_status_history.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold text-black/60">Tarix</h2>
          <div className="flex flex-col gap-1 text-xs text-black/50">
            {order.order_status_history.map((h) => (
              <p key={h.id}>
                {new Date(h.created_at).toLocaleString("uz-UZ")}:{" "}
                {STATUS_LABELS[h.from_status ?? ""] ?? h.from_status ?? "—"} →{" "}
                {STATUS_LABELS[h.to_status] ?? h.to_status}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

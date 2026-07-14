import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  advanceOrderStatus,
  cancelOrder,
  markDeliveryFeeCollected,
} from "@/actions/admin/orders";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Button } from "@/components/admin/ui/Button";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/ui/Badge";

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
      <PageHeader
        title={`Buyurtma № ${order.order_number}`}
        subtitle={new Date(order.created_at).toLocaleString("uz-UZ")}
        action={
          <div className="flex gap-2">
            {canAdvance && (
              <form action={advanceOrderStatus.bind(null, order.id)}>
                <Button type="submit">{NEXT_LABEL[order.status]}</Button>
              </form>
            )}
            {canCancel && (
              <form action={cancelOrder.bind(null, order.id)}>
                <Button type="submit" variant="danger">
                  Bekor qilish
                </Button>
              </form>
            )}
          </div>
        }
      />

      <Card>
        <div className="mb-3">
          <OrderStatusBadge status={order.status} />
        </div>
        <p className="text-sm text-gray-600">
          {order.ship_full_name}, {order.ship_phone}
        </p>
        <p className="text-sm text-gray-600">
          {order.ship_region}, {order.ship_city}, {order.ship_address_line}
        </p>
      </Card>

      <Card padded={false}>
        <div className="p-5 pb-0">
          <CardHeader title="Buyurtma tarkibi" />
        </div>
        <div className="flex flex-col divide-y divide-gray-100 px-5 pb-5">
          {order.order_items.map((item) => (
            <div key={item.id} className="flex justify-between py-2.5 text-sm first:pt-0 last:pb-0">
              <span className="text-gray-700">
                {item.product_name_snapshot}
                {item.variant_label_snapshot && ` (${item.variant_label_snapshot})`} × {item.qty}
              </span>
              <span className="font-medium text-gray-900">
                {formatPrice(item.line_total ?? item.unit_price * item.qty)}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Mahsulot (Payme)</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {formatPrice(Number(order.product_amount))}
            </span>
            <PaymentStatusBadge paid={order.product_payment_status === "paid"} />
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-gray-600">Yetkazib berish (naqd)</span>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">
              {formatPrice(Number(order.delivery_fee_amount))}
            </span>
            <PaymentStatusBadge
              paid={order.delivery_fee_payment_status === "collected"}
              label={order.delivery_fee_payment_status === "collected" ? "Olindi" : "Kutilmoqda"}
            />
            {order.delivery_fee_payment_status !== "collected" && (
              <form action={markDeliveryFeeCollected.bind(null, order.id)}>
                <button type="submit" className="text-xs font-medium text-[#4d7a1a] hover:underline">
                  Olindi deb belgilash
                </button>
              </form>
            )}
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-gray-100 pt-3 text-sm font-bold text-gray-900">
          <span>Jami</span>
          <span>{formatPrice(Number(order.total_amount))}</span>
        </div>
      </Card>

      {order.order_status_history.length > 0 && (
        <Card>
          <CardHeader title="Tarix" />
          <div className="flex flex-col gap-2 text-xs text-gray-500">
            {order.order_status_history.map((h) => (
              <p key={h.id}>
                {new Date(h.created_at).toLocaleString("uz-UZ")}:{" "}
                {STATUS_LABELS[h.from_status ?? ""] ?? h.from_status ?? "—"} →{" "}
                {STATUS_LABELS[h.to_status] ?? h.to_status}
              </p>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS: Record<string, string> = {
  received: "Qabul qilindi",
  preparing: "Tayyorlanmoqda",
  in_transit: "Yo'lda",
  delivered: "Yetkazildi",
  cancelled: "Bekor qilindi",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export default async function AccountOrderDetailPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", orderId)
    .eq("user_id", user!.id)
    .single();

  if (!order) notFound();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Buyurtma № {order.order_number}</h1>
        <p className="text-black/50">
          {new Date(order.created_at).toLocaleString("uz-UZ")}
        </p>
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
        <div className="flex justify-between">
          <span>Mahsulotlar ({order.product_payment_status === "paid" ? "to'landi" : "kutilmoqda"})</span>
          <span>{formatPrice(Number(order.product_amount))}</span>
        </div>
        <div className="flex justify-between">
          <span>
            Yetkazib berish (
            {order.delivery_fee_payment_status === "collected" ? "olindi" : "naqd olinadi"})
          </span>
          <span>{formatPrice(Number(order.delivery_fee_amount))}</span>
        </div>
        <div className="mt-2 flex justify-between border-t border-black/10 pt-2 font-bold">
          <span>Jami</span>
          <span>{formatPrice(Number(order.total_amount))}</span>
        </div>
      </div>
    </div>
  );
}

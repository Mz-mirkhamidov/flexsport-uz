import Link from "next/link";
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

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select("id, order_number, status, product_payment_status, delivery_fee_payment_status, total_amount, ship_full_name, ship_phone, created_at")
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: orders } = await query;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Buyurtmalar</h1>

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1 ${!status ? "border-black bg-black text-white" : "border-black/20"}`}
        >
          Barchasi
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/orders?status=${key}`}
            className={`rounded-full border px-3 py-1 ${status === key ? "border-black bg-black text-white" : "border-black/20"}`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-black/10 bg-black/5 text-left">
            <tr>
              <th className="px-4 py-2">№</th>
              <th className="px-4 py-2">Mijoz</th>
              <th className="px-4 py-2">Summa</th>
              <th className="px-4 py-2">To'lov</th>
              <th className="px-4 py-2">Holat</th>
              <th className="px-4 py-2">Sana</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b border-black/5">
                <td className="px-4 py-2 font-medium">{o.order_number}</td>
                <td className="px-4 py-2">
                  {o.ship_full_name}
                  <div className="text-xs text-black/50">{o.ship_phone}</div>
                </td>
                <td className="px-4 py-2">{formatPrice(Number(o.total_amount))}</td>
                <td className="px-4 py-2 text-xs">
                  Mahsulot: {o.product_payment_status === "paid" ? "✅" : "⏳"} · Yetk:{" "}
                  {o.delivery_fee_payment_status === "collected" ? "✅" : "⏳"}
                </td>
                <td className="px-4 py-2">{STATUS_LABELS[o.status] ?? o.status}</td>
                <td className="px-4 py-2 text-black/50">
                  {new Date(o.created_at).toLocaleDateString("uz-UZ")}
                </td>
                <td className="px-4 py-2">
                  <Link href={`/admin/orders/${o.id}`} className="hover:underline">
                    Ko&apos;rish
                  </Link>
                </td>
              </tr>
            ))}
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-black/50">
                  Buyurtmalar yo&apos;q
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

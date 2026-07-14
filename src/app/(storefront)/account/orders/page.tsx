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

export default async function AccountOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, status, product_payment_status, total_amount, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-bold">Buyurtmalarim</h1>
      {(orders ?? []).length === 0 ? (
        <p className="mt-4 text-black/60">Hozircha buyurtmalar yo&apos;q.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          {(orders ?? []).map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.id}`}
              className="flex items-center justify-between rounded border border-black/10 p-4 text-sm hover:border-[#8DC63F]"
            >
              <div>
                <p className="font-medium">№ {o.order_number}</p>
                <p className="text-black/50">
                  {new Date(o.created_at).toLocaleDateString("uz-UZ")}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{formatPrice(Number(o.total_amount))}</p>
                <p className="text-black/50">
                  {STATUS_LABELS[o.status] ?? o.status}
                  {o.product_payment_status !== "paid" && " · to'lanmagan"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

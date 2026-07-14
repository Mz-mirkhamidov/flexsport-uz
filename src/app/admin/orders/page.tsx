import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { TableShell, Th, Td, Tr } from "@/components/admin/ui/Table";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { OrderStatusBadge, PaymentStatusBadge } from "@/components/admin/ui/Badge";

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
      <PageHeader title="Buyurtmalar" subtitle={`${(orders ?? []).length} ta buyurtma`} />

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/orders"
          className={`rounded-full border px-3 py-1.5 font-medium transition ${
            !status
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 text-gray-600 hover:border-gray-400"
          }`}
        >
          Barchasi
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, label]) => (
          <Link
            key={key}
            href={`/admin/orders?status=${key}`}
            className={`rounded-full border px-3 py-1.5 font-medium transition ${
              status === key
                ? "border-gray-900 bg-gray-900 text-white"
                : "border-gray-200 text-gray-600 hover:border-gray-400"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <TableShell>
        <thead>
          <tr>
            <Th>№</Th>
            <Th>Mijoz</Th>
            <Th>Summa</Th>
            <Th>To&apos;lov</Th>
            <Th>Holat</Th>
            <Th>Sana</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {(orders ?? []).map((o) => (
            <Tr key={o.id}>
              <Td className="font-medium text-gray-900">{o.order_number}</Td>
              <Td>
                {o.ship_full_name}
                <div className="text-xs text-gray-400">{o.ship_phone}</div>
              </Td>
              <Td className="font-medium text-gray-900">{formatPrice(Number(o.total_amount))}</Td>
              <Td>
                <div className="flex flex-col gap-1">
                  <PaymentStatusBadge
                    paid={o.product_payment_status === "paid"}
                    label={o.product_payment_status === "paid" ? "Mahsulot to'landi" : "Mahsulot kutilmoqda"}
                  />
                  <PaymentStatusBadge
                    paid={o.delivery_fee_payment_status === "collected"}
                    label={o.delivery_fee_payment_status === "collected" ? "Yetk. olindi" : "Yetk. kutilmoqda"}
                  />
                </div>
              </Td>
              <Td>
                <OrderStatusBadge status={o.status} />
              </Td>
              <Td className="text-gray-400">
                {new Date(o.created_at).toLocaleDateString("uz-UZ")}
              </Td>
              <Td>
                <Link
                  href={`/admin/orders/${o.id}`}
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Ko&apos;rish
                </Link>
              </Td>
            </Tr>
          ))}
          {(orders ?? []).length === 0 && <EmptyState title="Buyurtmalar yo'q" colSpan={7} />}
        </tbody>
      </TableShell>
    </div>
  );
}

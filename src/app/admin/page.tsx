import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { StatCard } from "@/components/admin/ui/StatCard";
import { OrderStatusBadge } from "@/components/admin/ui/Badge";
import { EmptyState } from "@/components/admin/ui/EmptyState";

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function RevenueIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function OrdersStatIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
      <path d="M6 2 4 5v15a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1V5l-2-3Z" />
      <path d="M4 5h16" />
    </svg>
  );
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { data: paidOrders },
    { data: recentOrders },
    { data: recentItems },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .in("status", ["received", "preparing", "in_transit"]),
    supabase
      .from("orders")
      .select("total_amount, created_at")
      .eq("product_payment_status", "paid"),
    supabase
      .from("orders")
      .select("id, order_number, status, total_amount, ship_full_name, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("order_items")
      .select("product_name_snapshot, qty, orders!inner(product_payment_status, created_at)")
      .eq("orders.product_payment_status", "paid")
      .gte("orders.created_at", thirtyDaysAgo.toISOString()),
  ]);

  const monthRevenue = (paidOrders ?? [])
    .filter((o) => new Date(o.created_at) >= startOfMonth)
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
  const lastMonthRevenue = (paidOrders ?? [])
    .filter(
      (o) =>
        new Date(o.created_at) >= startOfLastMonth &&
        new Date(o.created_at) < startOfMonth,
    )
    .reduce((sum, o) => sum + Number(o.total_amount), 0);
  const todayRevenue = (paidOrders ?? [])
    .filter((o) => new Date(o.created_at) >= startOfDay(now))
    .reduce((sum, o) => sum + Number(o.total_amount), 0);

  const salesByProduct = new Map<string, number>();
  for (const item of recentItems ?? []) {
    salesByProduct.set(
      item.product_name_snapshot,
      (salesByProduct.get(item.product_name_snapshot) ?? 0) + item.qty,
    );
  }
  const topProducts = [...salesByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  const maxTopQty = Math.max(1, ...topProducts.map(([, qty]) => qty));

  const dailyRevenue: { date: string; total: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const day = startOfDay(new Date(now.getTime() - i * 24 * 60 * 60 * 1000));
    const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    const total = (paidOrders ?? [])
      .filter((o) => {
        const created = new Date(o.created_at);
        return created >= day && created < nextDay;
      })
      .reduce((sum, o) => sum + Number(o.total_amount), 0);
    dailyRevenue.push({
      date: day.toLocaleDateString("uz-UZ", { day: "2-digit", month: "2-digit" }),
      total,
    });
  }
  const maxDaily = Math.max(1, ...dailyRevenue.map((d) => d.total));

  return (
    <div className="flex flex-col gap-8">
      <PageHeader title="Dashboard" subtitle="Do'koningizning umumiy holati" />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Bugungi savdo" value={formatPrice(todayRevenue)} icon={<RevenueIcon />} />
        <StatCard
          label="Shu oy"
          value={formatPrice(monthRevenue)}
          hint={`O'tgan oy: ${formatPrice(lastMonthRevenue)}`}
          icon={<RevenueIcon />}
        />
        <StatCard label="Jami buyurtmalar" value={totalOrders ?? 0} icon={<OrdersStatIcon />} />
        <StatCard
          label="Jarayondagi"
          value={pendingOrders ?? 0}
          hint="Qabul qilindi / Tayyorlanmoqda / Yo'lda"
          icon={<OrdersStatIcon />}
        />
      </div>

      <Card>
        <CardHeader title="So'nggi 7 kunlik savdo" />
        <div className="flex h-40 items-end gap-3">
          {dailyRevenue.map((d) => (
            <div key={d.date} className="group flex flex-1 flex-col items-center gap-2">
              <div className="relative flex w-full flex-1 items-end">
                <div
                  className="w-full rounded-t-md bg-[#8DC63F] transition group-hover:bg-gray-900"
                  style={{ height: `${Math.max(4, (d.total / maxDaily) * 100)}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-gray-400">{d.date}</span>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader title="Eng ko'p sotilgan (30 kun)" />
          </div>
          <div className="px-5 pb-5">
            {topProducts.length === 0 ? (
              <EmptyState title="Hali sotuv yo'q" />
            ) : (
              <div className="flex flex-col gap-3">
                {topProducts.map(([name, qty]) => (
                  <div key={name} className="flex items-center gap-3 text-sm">
                    <span className="flex-1 truncate text-gray-700">{name}</span>
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-[#8DC63F]"
                        style={{ width: `${(qty / maxTopQty) * 100}%` }}
                      />
                    </div>
                    <span className="w-14 shrink-0 text-right font-semibold text-gray-900">
                      {qty} dona
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card padded={false}>
          <div className="p-5 pb-0">
            <CardHeader title="So'nggi buyurtmalar" />
          </div>
          <div className="px-5 pb-5">
            {(recentOrders ?? []).length === 0 ? (
              <EmptyState title="Hali buyurtma yo'q" />
            ) : (
              <div className="flex flex-col divide-y divide-gray-100">
                {(recentOrders ?? []).map((o) => (
                  <Link
                    key={o.id}
                    href={`/admin/orders/${o.id}`}
                    className="flex items-center justify-between gap-3 py-3 text-sm first:pt-0 last:pb-0 hover:text-gray-900"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900">№ {o.order_number}</p>
                      <p className="truncate text-gray-500">{o.ship_full_name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-semibold text-gray-900">
                        {formatPrice(Number(o.total_amount))}
                      </p>
                      <OrderStatusBadge status={o.status} />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

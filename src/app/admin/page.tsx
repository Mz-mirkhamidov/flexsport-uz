import { createClient } from "@/lib/supabase/server";

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

function startOfDay(d: Date) {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
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

  const STATUS_LABELS: Record<string, string> = {
    received: "Qabul qilindi",
    preparing: "Tayyorlanmoqda",
    in_transit: "Yo'lda",
    delivered: "Yetkazildi",
    cancelled: "Bekor qilindi",
  };

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="rounded border border-black/10 bg-white p-4">
          <p className="text-xs text-black/50">Bugungi savdo</p>
          <p className="mt-1 text-xl font-bold">{formatPrice(todayRevenue)}</p>
        </div>
        <div className="rounded border border-black/10 bg-white p-4">
          <p className="text-xs text-black/50">Shu oy</p>
          <p className="mt-1 text-xl font-bold">{formatPrice(monthRevenue)}</p>
          <p className="text-xs text-black/40">
            O&apos;tgan oy: {formatPrice(lastMonthRevenue)}
          </p>
        </div>
        <div className="rounded border border-black/10 bg-white p-4">
          <p className="text-xs text-black/50">Jami buyurtmalar</p>
          <p className="mt-1 text-xl font-bold">{totalOrders ?? 0}</p>
        </div>
        <div className="rounded border border-black/10 bg-white p-4">
          <p className="text-xs text-black/50">Jarayondagi buyurtmalar</p>
          <p className="mt-1 text-xl font-bold">{pendingOrders ?? 0}</p>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">So&apos;nggi 7 kunlik savdo</h2>
        <div className="flex h-40 items-end gap-3 rounded border border-black/10 bg-white p-4">
          {dailyRevenue.map((d) => (
            <div key={d.date} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-full rounded-t bg-[#8DC63F]"
                style={{ height: `${Math.max(4, (d.total / maxDaily) * 100)}px` }}
              />
              <span className="text-[10px] text-black/50">{d.date}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">
            Eng ko&apos;p sotilgan (30 kun)
          </h2>
          <div className="rounded border border-black/10 bg-white">
            {topProducts.length === 0 ? (
              <p className="p-4 text-sm text-black/50">Hali sotuv yo&apos;q</p>
            ) : (
              topProducts.map(([name, qty]) => (
                <div
                  key={name}
                  className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-sm last:border-0"
                >
                  <span>{name}</span>
                  <span className="font-semibold">{qty} dona</span>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">So&apos;nggi buyurtmalar</h2>
          <div className="rounded border border-black/10 bg-white">
            {(recentOrders ?? []).length === 0 ? (
              <p className="p-4 text-sm text-black/50">Hali buyurtma yo&apos;q</p>
            ) : (
              (recentOrders ?? []).map((o) => (
                <div
                  key={o.id}
                  className="flex items-center justify-between border-b border-black/5 px-4 py-2 text-sm last:border-0"
                >
                  <div>
                    <span className="font-medium">№ {o.order_number}</span>
                    <span className="ml-2 text-black/50">{o.ship_full_name}</span>
                  </div>
                  <div className="text-right">
                    <p>{formatPrice(Number(o.total_amount))}</p>
                    <p className="text-xs text-black/50">
                      {STATUS_LABELS[o.status] ?? o.status}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

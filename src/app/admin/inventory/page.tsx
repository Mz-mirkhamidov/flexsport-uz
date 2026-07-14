import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateVariantStock } from "@/actions/admin/products";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ low?: string }>;
}) {
  const { low } = await searchParams;
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, size, color, stock_qty, products(id, name, slug, low_stock_threshold)")
    .order("stock_qty", { ascending: true });

  const rows = (variants ?? []).filter((v) => v.products);
  const filtered = low
    ? rows.filter((v) => v.stock_qty <= (v.products?.low_stock_threshold ?? 5))
    : rows;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ombor</h1>
        <div className="flex gap-2 text-sm">
          <Link
            href="/admin/inventory"
            className={`rounded-full border px-3 py-1 ${!low ? "border-black bg-black text-white" : "border-black/20"}`}
          >
            Barchasi
          </Link>
          <Link
            href="/admin/inventory?low=1"
            className={`rounded-full border px-3 py-1 ${low ? "border-black bg-black text-white" : "border-black/20"}`}
          >
            Kam qolganlar
          </Link>
        </div>
      </div>

      <div className="overflow-x-auto rounded border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-black/10 bg-black/5 text-left">
            <tr>
              <th className="px-4 py-2">Mahsulot</th>
              <th className="px-4 py-2">Variant</th>
              <th className="px-4 py-2">Qoldiq</th>
              <th className="px-4 py-2">Chegara</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const threshold = v.products?.low_stock_threshold ?? 5;
              const isLow = v.stock_qty <= threshold;
              return (
                <tr key={v.id} className="border-b border-black/5">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/products/${v.products?.id}/edit`}
                      className="hover:underline"
                    >
                      {v.products?.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-black/60">
                    {[v.size, v.color].filter(Boolean).join(" / ") || "Standart"}
                  </td>
                  <td className="px-4 py-2">
                    <span className={isLow ? "font-semibold text-red-600" : ""}>
                      {v.stock_qty}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-black/50">{threshold}</td>
                  <td className="px-4 py-2">
                    <form
                      action={updateVariantStock.bind(null, v.id, v.products!.id)}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="number"
                        name="stockQty"
                        defaultValue={v.stock_qty}
                        min={0}
                        className="w-20 rounded border border-black/20 px-2 py-1"
                      />
                      <button type="submit" className="text-xs text-black/60 hover:underline">
                        Yangilash
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-black/50">
                  Hech narsa topilmadi
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

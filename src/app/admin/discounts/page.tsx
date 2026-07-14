import { createClient } from "@/lib/supabase/server";
import { DiscountForm } from "@/components/admin/DiscountForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteDiscount, toggleDiscountActive } from "@/actions/admin/discounts";

function scopeLabel(d: {
  scope: string;
  categories: { name: string } | null;
  products: { name: string } | null;
}) {
  if (d.scope === "global") return "Butun katalog";
  if (d.scope === "category") return `Kategoriya: ${d.categories?.name ?? "—"}`;
  return `Mahsulot: ${d.products?.name ?? "—"}`;
}

export default async function AdminDiscountsPage() {
  const supabase = await createClient();

  const [{ data: discounts }, { data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("discounts")
      .select("*, categories(name), products(name)")
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("sort_order"),
    supabase.from("products").select("id, name").order("name"),
  ]);

  const now = Date.now();

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Skidkalar</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <div className="overflow-x-auto rounded border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 bg-black/5 text-left">
              <tr>
                <th className="px-4 py-2">Qamrov</th>
                <th className="px-4 py-2">Foiz</th>
                <th className="px-4 py-2">Muddat</th>
                <th className="px-4 py-2">Holat</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {(discounts ?? []).map((d) => {
                const isRunning =
                  d.is_active &&
                  new Date(d.starts_at).getTime() <= now &&
                  new Date(d.ends_at).getTime() >= now;
                return (
                  <tr key={d.id} className="border-b border-black/5">
                    <td className="px-4 py-2">{scopeLabel(d)}</td>
                    <td className="px-4 py-2">{d.percent}%</td>
                    <td className="px-4 py-2 text-xs text-black/50">
                      {new Date(d.starts_at).toLocaleDateString("uz-UZ")} —{" "}
                      {new Date(d.ends_at).toLocaleDateString("uz-UZ")}
                    </td>
                    <td className="px-4 py-2">
                      {isRunning ? (
                        <span className="text-[#8DC63F]">Faol (ishlamoqda)</span>
                      ) : d.is_active ? (
                        <span className="text-black/50">Rejalashtirilgan/tugagan</span>
                      ) : (
                        <span className="text-black/30">O&apos;chirilgan</span>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <form action={toggleDiscountActive.bind(null, d.id, d.is_active)}>
                          <button type="submit" className="text-sm hover:underline">
                            {d.is_active ? "O'chirish" : "Yoqish"}
                          </button>
                        </form>
                        <DeleteButton
                          action={deleteDiscount.bind(null, d.id)}
                          confirmMessage="Skidkani butunlay o'chirasizmi?"
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {(discounts ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-black/50">
                    Skidkalar yo&apos;q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-black/60">
            Yangi skidka
          </h2>
          <DiscountForm categories={categories ?? []} products={products ?? []} />
        </div>
      </div>
    </div>
  );
}

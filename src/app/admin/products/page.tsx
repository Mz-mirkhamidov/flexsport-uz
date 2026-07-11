import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProduct } from "@/actions/admin/products";

export default async function AdminProductsPage() {
  const supabase = await createClient();
  const { data: products } = await supabase
    .from("products")
    .select("id, name, base_price, discount_pct, is_active, categories(name)")
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mahsulotlar</h1>
        <Link
          href="/admin/products/new"
          className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-[#8DC63F]"
        >
          + Yangi mahsulot
        </Link>
      </div>

      <div className="overflow-x-auto rounded border border-black/10 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-black/10 bg-black/5 text-left">
            <tr>
              <th className="px-4 py-2">Nomi</th>
              <th className="px-4 py-2">Kategoriya</th>
              <th className="px-4 py-2">Narx</th>
              <th className="px-4 py-2">Chegirma</th>
              <th className="px-4 py-2">Holat</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((p) => (
              <tr key={p.id} className="border-b border-black/5">
                <td className="px-4 py-2 font-medium">{p.name}</td>
                <td className="px-4 py-2 text-black/60">
                  {p.categories?.name ?? "—"}
                </td>
                <td className="px-4 py-2">{p.base_price}</td>
                <td className="px-4 py-2">
                  {p.discount_pct ? `${p.discount_pct}%` : "—"}
                </td>
                <td className="px-4 py-2">
                  {p.is_active ? "Faol" : "Nofaol"}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${p.id}/edit`}
                      className="text-sm hover:underline"
                    >
                      Tahrirlash
                    </Link>
                    <DeleteButton
                      action={deleteProduct.bind(null, p.id)}
                      confirmMessage={`"${p.name}" mahsulotini o'chirasizmi?`}
                    />
                  </div>
                </td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-black/50">
                  Mahsulotlar yo&apos;q
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

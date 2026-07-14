import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { updateVariantStock } from "@/actions/admin/products";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { TableShell, Th, Td, Tr } from "@/components/admin/ui/Table";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Badge } from "@/components/admin/ui/Badge";
import { Input } from "@/components/admin/ui/Field";

const PAGE_SIZE = 50;

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ low?: string; page?: string }>;
}) {
  const { low, page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const supabase = await createClient();

  const { data: variants } = await supabase
    .from("product_variants")
    .select("id, size, color, stock_qty, products(id, name, slug, low_stock_threshold)")
    .order("stock_qty", { ascending: true });

  const rows = (variants ?? []).filter((v) => v.products);
  const filtered = low
    ? rows.filter((v) => v.stock_qty <= (v.products?.low_stock_threshold ?? 5))
    : rows;

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const from = (page - 1) * PAGE_SIZE;
  const paged = filtered.slice(from, from + PAGE_SIZE);
  const lowCount = rows.filter(
    (v) => v.stock_qty <= (v.products?.low_stock_threshold ?? 5),
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Ombor"
        subtitle={`${rows.length} ta variant, shundan ${lowCount} tasi kam qolgan`}
      />

      <div className="flex flex-wrap gap-2 text-sm">
        <Link
          href="/admin/inventory"
          className={`rounded-full border px-3 py-1.5 font-medium transition ${
            !low
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 text-gray-600 hover:border-gray-400"
          }`}
        >
          Barchasi
        </Link>
        <Link
          href="/admin/inventory?low=1"
          className={`rounded-full border px-3 py-1.5 font-medium transition ${
            low
              ? "border-gray-900 bg-gray-900 text-white"
              : "border-gray-200 text-gray-600 hover:border-gray-400"
          }`}
        >
          Kam qolganlar ({lowCount})
        </Link>
      </div>

      <TableShell>
        <thead>
          <tr>
            <Th>Mahsulot</Th>
            <Th>Variant</Th>
            <Th>Qoldiq</Th>
            <Th>Chegara</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {paged.map((v) => {
            const threshold = v.products?.low_stock_threshold ?? 5;
            const isLow = v.stock_qty <= threshold;
            return (
              <Tr key={v.id}>
                <Td>
                  <Link
                    href={`/admin/products/${v.products?.id}/edit`}
                    className="font-medium text-gray-900 hover:text-[#4d7a1a]"
                  >
                    {v.products?.name}
                  </Link>
                </Td>
                <Td>{[v.size, v.color].filter(Boolean).join(" / ") || "Standart"}</Td>
                <Td>
                  {isLow ? (
                    <Badge tone={v.stock_qty === 0 ? "red" : "amber"}>{v.stock_qty} dona</Badge>
                  ) : (
                    <span className="text-gray-700">{v.stock_qty} dona</span>
                  )}
                </Td>
                <Td className="text-gray-400">{threshold}</Td>
                <Td>
                  <form
                    action={updateVariantStock.bind(null, v.id, v.products!.id)}
                    className="flex items-center gap-2"
                  >
                    <Input
                      type="number"
                      name="stockQty"
                      defaultValue={v.stock_qty}
                      min={0}
                      className="w-20 py-1"
                    />
                    <button type="submit" className="text-xs font-medium text-gray-500 hover:text-gray-900">
                      Yangilash
                    </button>
                  </form>
                </Td>
              </Tr>
            );
          })}
          {paged.length === 0 && <EmptyState title="Hech narsa topilmadi" colSpan={5} />}
        </tbody>
      </TableShell>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/inventory?${new URLSearchParams({
                ...(low ? { low } : {}),
                page: String(p),
              }).toString()}`}
              className={`rounded-lg px-3 py-1.5 ${
                p === page
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

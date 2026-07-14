import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteProduct } from "@/actions/admin/products";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Input } from "@/components/admin/ui/Field";
import { TableShell, Th, Td, Tr } from "@/components/admin/ui/Table";
import { EmptyState } from "@/components/admin/ui/EmptyState";

const PAGE_SIZE = 50;

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page: pageParam } = await searchParams;
  const page = Number(pageParam) || 1;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, name, base_price, discount_pct, is_active, categories(name)", {
      count: "exact",
    })
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("name", `%${q}%`);

  const from = (page - 1) * PAGE_SIZE;
  const { data: products, count } = await query.range(from, from + PAGE_SIZE - 1);
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Mahsulotlar"
        subtitle={`${count ?? 0} ta mahsulot`}
        action={
          <Link href="/admin/products/new">
            <Button>+ Yangi mahsulot</Button>
          </Link>
        }
      />

      <form method="get" action="/admin/products" className="flex gap-2">
        <Input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Nomi bo'yicha qidirish..."
          className="max-w-xs"
        />
        <Button type="submit" variant="secondary">
          Qidirish
        </Button>
      </form>

      <TableShell>
        <thead>
          <tr>
            <Th>Nomi</Th>
            <Th>Kategoriya</Th>
            <Th>Narx</Th>
            <Th>Chegirma</Th>
            <Th>Holat</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {(products ?? []).map((p) => (
            <Tr key={p.id}>
              <Td className="font-medium text-gray-900">{p.name}</Td>
              <Td>{p.categories?.name ?? "—"}</Td>
              <Td>{formatPrice(p.base_price)}</Td>
              <Td>{p.discount_pct ? `${p.discount_pct}%` : "—"}</Td>
              <Td>
                <Badge tone={p.is_active ? "green" : "gray"}>
                  {p.is_active ? "Faol" : "Nofaol"}
                </Badge>
              </Td>
              <Td>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/products/${p.id}/edit`}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900"
                  >
                    Tahrirlash
                  </Link>
                  <DeleteButton
                    action={deleteProduct.bind(null, p.id)}
                    confirmMessage={`"${p.name}" mahsulotini o'chirasizmi?`}
                  />
                </div>
              </Td>
            </Tr>
          ))}
          {(products ?? []).length === 0 && <EmptyState title="Mahsulotlar topilmadi" colSpan={6} />}
        </tbody>
      </TableShell>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/products?${new URLSearchParams({
                ...(q ? { q } : {}),
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

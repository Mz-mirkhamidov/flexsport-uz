import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { archiveProduct } from "@/actions/admin/products";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Button } from "@/components/admin/ui/Button";
import { Badge } from "@/components/admin/ui/Badge";
import { Input } from "@/components/admin/ui/Field";
import { TableShell, Th, Td, Tr } from "@/components/admin/ui/Table";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import {
  PRODUCT_STATUS_LABEL,
  PRODUCT_STATUS_OPTIONS,
  type ProductStatus,
} from "@/lib/catalog/product-status";

const PAGE_SIZE = 50;

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

const STATUS_TONE = {
  draft: "amber",
  active: "green",
  hidden: "blue",
  archived: "gray",
} as const;

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: ProductStatus }>;
}) {
  const { q, page: pageParam, status } = await searchParams;
  const page = Number(pageParam) || 1;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      "id, name, base_price, cost_price, discount_pct, status, categories(name), product_variants(stock_qty, reserved_qty)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false });
  if (q) query = query.ilike("name", `%${q}%`);
  if (status) query = query.eq("status", status);

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

      <form method="get" action="/admin/products" className="flex flex-wrap gap-2">
        <Input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Nomi bo'yicha qidirish..."
          className="max-w-xs"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700"
        >
          <option value="">Barcha holatlar</option>
          {PRODUCT_STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Button type="submit" variant="secondary">Qidirish</Button>
      </form>

      <TableShell>
        <thead>
          <tr>
            <Th>Nomi</Th>
            <Th>Kategoriya</Th>
            <Th>Kelish narxi</Th>
            <Th>Sotilish narxi</Th>
            <Th>Chegirma</Th>
            <Th>Qoldiq</Th>
            <Th>Holat</Th>
            <Th></Th>
          </tr>
        </thead>
        <tbody>
          {(products ?? []).map((product) => {
            const stock = product.product_variants.reduce(
              (sum, variant) => sum + Math.max(0, variant.stock_qty - variant.reserved_qty),
              0,
            );
            return (
              <Tr key={product.id}>
                <Td className="font-medium text-gray-900">{product.name}</Td>
                <Td>{product.categories?.name ?? "—"}</Td>
                <Td>{product.cost_price == null ? "—" : formatPrice(product.cost_price)}</Td>
                <Td>{formatPrice(product.base_price)}</Td>
                <Td>{product.discount_pct ? `${product.discount_pct}%` : "—"}</Td>
                <Td>{stock} dona</Td>
                <Td>
                  <Badge tone={STATUS_TONE[product.status]}>
                    {PRODUCT_STATUS_LABEL[product.status]}
                  </Badge>
                </Td>
                <Td>
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="text-sm font-medium text-gray-600 hover:text-gray-900"
                    >
                      Tahrirlash
                    </Link>
                    {product.status !== "archived" && (
                      <DeleteButton
                        action={archiveProduct.bind(null, product.id)}
                        label="Arxivga"
                        confirmMessage={`"${product.name}" mahsulotini arxivga o'tkazasizmi?`}
                      />
                    )}
                  </div>
                </Td>
              </Tr>
            );
          })}
          {(products ?? []).length === 0 && (
            <EmptyState title="Mahsulotlar topilmadi" colSpan={8} />
          )}
        </tbody>
      </TableShell>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
            <Link
              key={pageNumber}
              href={`/admin/products?${new URLSearchParams({
                ...(q ? { q } : {}),
                ...(status ? { status } : {}),
                page: String(pageNumber),
              }).toString()}`}
              className={`rounded-lg px-3 py-1.5 ${
                pageNumber === page
                  ? "bg-gray-900 text-white"
                  : "border border-gray-200 text-gray-600 hover:border-gray-400"
              }`}
            >
              {pageNumber}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

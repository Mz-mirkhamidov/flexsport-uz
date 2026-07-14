import { createClient } from "@/lib/supabase/server";
import { DiscountForm } from "@/components/admin/DiscountForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { deleteDiscount, toggleDiscountActive } from "@/actions/admin/discounts";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { TableShell, Th, Td, Tr } from "@/components/admin/ui/Table";
import { EmptyState } from "@/components/admin/ui/EmptyState";
import { Badge } from "@/components/admin/ui/Badge";

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
    <div className="flex flex-col gap-6">
      <PageHeader title="Skidkalar" subtitle={`${(discounts ?? []).length} ta skidka`} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
        <TableShell>
          <thead>
            <tr>
              <Th>Qamrov</Th>
              <Th>Foiz</Th>
              <Th>Muddat</Th>
              <Th>Holat</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {(discounts ?? []).map((d) => {
              const isRunning =
                d.is_active &&
                new Date(d.starts_at).getTime() <= now &&
                new Date(d.ends_at).getTime() >= now;
              return (
                <Tr key={d.id}>
                  <Td className="font-medium text-gray-900">{scopeLabel(d)}</Td>
                  <Td>{d.percent}%</Td>
                  <Td className="text-xs text-gray-400">
                    {new Date(d.starts_at).toLocaleDateString("uz-UZ")} —{" "}
                    {new Date(d.ends_at).toLocaleDateString("uz-UZ")}
                  </Td>
                  <Td>
                    {isRunning ? (
                      <Badge tone="green">Ishlamoqda</Badge>
                    ) : d.is_active ? (
                      <Badge tone="blue">Rejalashtirilgan/tugagan</Badge>
                    ) : (
                      <Badge tone="gray">O&apos;chirilgan</Badge>
                    )}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <form action={toggleDiscountActive.bind(null, d.id, d.is_active)}>
                        <button type="submit" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                          {d.is_active ? "O'chirish" : "Yoqish"}
                        </button>
                      </form>
                      <DeleteButton
                        action={deleteDiscount.bind(null, d.id)}
                        confirmMessage="Skidkani butunlay o'chirasizmi?"
                      />
                    </div>
                  </Td>
                </Tr>
              );
            })}
            {(discounts ?? []).length === 0 && <EmptyState title="Skidkalar yo'q" colSpan={5} />}
          </tbody>
        </TableShell>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Yangi skidka</h2>
          <DiscountForm categories={categories ?? []} products={products ?? []} />
        </div>
      </div>
    </div>
  );
}

import { Fragment } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "@/actions/admin/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Badge } from "@/components/admin/ui/Badge";
import { TableShell, Th, Td, Tr } from "@/components/admin/ui/Table";
import { EmptyState } from "@/components/admin/ui/EmptyState";

export default async function AdminCategoriesPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order", { ascending: true });

  const all = categories ?? [];
  const topLevel = all.filter((c) => !c.parent_id);
  const childrenOf = (id: string) => all.filter((c) => c.parent_id === id);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Kategoriyalar" subtitle={`${all.length} ta kategoriya`} />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <TableShell>
          <thead>
            <tr>
              <Th>Nomi</Th>
              <Th>Slug</Th>
              <Th>Tartib</Th>
              <Th>Holat</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {topLevel.map((cat) => (
              <Fragment key={cat.id}>
                <Tr>
                  <Td className="font-medium text-gray-900">{cat.name}</Td>
                  <Td className="text-gray-400">{cat.slug}</Td>
                  <Td>{cat.sort_order}</Td>
                  <Td>
                    <Badge tone={cat.is_active ? "green" : "gray"}>
                      {cat.is_active ? "Faol" : "Nofaol"}
                    </Badge>
                  </Td>
                  <Td>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/admin/categories/${cat.id}/edit`}
                        className="text-sm font-medium text-gray-600 hover:text-gray-900"
                      >
                        Tahrirlash
                      </Link>
                      <DeleteButton
                        action={deleteCategory.bind(null, cat.id)}
                        confirmMessage={`"${cat.name}" kategoriyasini o'chirasizmi?`}
                      />
                    </div>
                  </Td>
                </Tr>
                {childrenOf(cat.id).map((child) => (
                  <Tr key={child.id}>
                    <Td className="pl-8 text-gray-600">└ {child.name}</Td>
                    <Td className="text-gray-400">{child.slug}</Td>
                    <Td>{child.sort_order}</Td>
                    <Td>
                      <Badge tone={child.is_active ? "green" : "gray"}>
                        {child.is_active ? "Faol" : "Nofaol"}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/categories/${child.id}/edit`}
                          className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                          Tahrirlash
                        </Link>
                        <DeleteButton
                          action={deleteCategory.bind(null, child.id)}
                          confirmMessage={`"${child.name}" kategoriyasini o'chirasizmi?`}
                        />
                      </div>
                    </Td>
                  </Tr>
                ))}
              </Fragment>
            ))}
            {all.length === 0 && <EmptyState title="Kategoriyalar yo'q" colSpan={5} />}
          </tbody>
        </TableShell>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-gray-900">
            Yangi kategoriya
          </h2>
          <CategoryForm categories={all} />
        </div>
      </div>
    </div>
  );
}

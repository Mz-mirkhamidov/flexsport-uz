import { Fragment } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { deleteCategory } from "@/actions/admin/categories";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

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
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-bold">Kategoriyalar</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div className="overflow-x-auto rounded border border-black/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 bg-black/5 text-left">
              <tr>
                <th className="px-4 py-2">Nomi</th>
                <th className="px-4 py-2">Slug</th>
                <th className="px-4 py-2">Tartib</th>
                <th className="px-4 py-2">Holat</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {topLevel.map((cat) => (
                <Fragment key={cat.id}>
                  <tr className="border-b border-black/5">
                    <td className="px-4 py-2 font-medium">{cat.name}</td>
                    <td className="px-4 py-2 text-black/50">{cat.slug}</td>
                    <td className="px-4 py-2">{cat.sort_order}</td>
                    <td className="px-4 py-2">
                      {cat.is_active ? "Faol" : "Nofaol"}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-3">
                        <Link
                          href={`/admin/categories/${cat.id}/edit`}
                          className="text-sm text-black hover:underline"
                        >
                          Tahrirlash
                        </Link>
                        <DeleteButton
                          action={deleteCategory.bind(null, cat.id)}
                          confirmMessage={`"${cat.name}" kategoriyasini o'chirasizmi?`}
                        />
                      </div>
                    </td>
                  </tr>
                  {childrenOf(cat.id).map((child) => (
                    <tr key={child.id} className="border-b border-black/5 bg-black/[.02]">
                      <td className="px-4 py-2 pl-8 text-black/80">
                        └ {child.name}
                      </td>
                      <td className="px-4 py-2 text-black/50">{child.slug}</td>
                      <td className="px-4 py-2">{child.sort_order}</td>
                      <td className="px-4 py-2">
                        {child.is_active ? "Faol" : "Nofaol"}
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-3">
                          <Link
                            href={`/admin/categories/${child.id}/edit`}
                            className="text-sm text-black hover:underline"
                          >
                            Tahrirlash
                          </Link>
                          <DeleteButton
                            action={deleteCategory.bind(null, child.id)}
                            confirmMessage={`"${child.name}" kategoriyasini o'chirasizmi?`}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
              {all.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-black/50">
                    Kategoriyalar yo&apos;q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold text-black/60">
            Yangi kategoriya
          </h2>
          <CategoryForm categories={all} />
        </div>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  const supabase = await createClient();

  const [{ data: category }, { data: categories }] = await Promise.all([
    supabase.from("categories").select("*").eq("id", categoryId).single(),
    supabase.from("categories").select("*").order("sort_order"),
  ]);

  if (!category) notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Kategoriyani tahrirlash</h1>
      <div className="max-w-md">
        <CategoryForm categories={categories ?? []} category={category} />
      </div>
    </div>
  );
}

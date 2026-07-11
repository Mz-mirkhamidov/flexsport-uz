import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Yangi mahsulot</h1>
      <div className="max-w-2xl">
        <ProductForm categories={categories ?? []} />
      </div>
    </div>
  );
}

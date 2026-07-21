import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="1. Yangi mahsulot" subtitle="Avval asosiy ma’lumotlarni saqlang. Keyingi oynada rang, qoldiq va rasmlarni qo‘shasiz." />
      <div className="max-w-2xl">
        <ProductForm categories={categories ?? []} />
      </div>
    </div>
  );
}

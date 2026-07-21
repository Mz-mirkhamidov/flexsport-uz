import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/components/admin/ProductForm";
import { VariantsSection } from "@/components/admin/VariantsSection";
import { ImagesSection } from "@/components/admin/ImagesSection";
import { PageHeader } from "@/components/admin/ui/PageHeader";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: categories }, { data: variants }, { data: images }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*, brands(name)")
        .eq("id", productId)
        .single(),
      supabase.from("categories").select("*").order("sort_order"),
      supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", productId)
        .order("created_at"),
      supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order"),
    ]);

  if (!product) notFound();

  return (
    <div className="flex flex-col gap-10">
      <div>
        <PageHeader title="Mahsulotni tahrirlash" subtitle={product.name} />
        <div className="max-w-2xl">
          <ProductForm categories={categories ?? []} product={product} />
        </div>
      </div>

      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900">2. Rang, o‘lcham va qoldiq</h2>
        <p className="mb-3 text-sm text-gray-500">Har bir rang va o‘lchamni alohida variant qilib kiriting.</p>
        <VariantsSection productId={productId} variants={variants ?? []} />
      </div>

      <div>
        <h2 className="mb-1 text-lg font-semibold text-gray-900">3. Rasmlar</h2>
        <p className="mb-3 text-sm text-gray-500">Rasmni rangga bog‘lasangiz, xaridor shu rangni tanlaganda aynan o‘sha rasm ochiladi.</p>
        <ImagesSection productId={productId} images={images ?? []} variants={variants ?? []} />
      </div>
    </div>
  );
}

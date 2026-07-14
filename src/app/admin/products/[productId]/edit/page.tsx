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
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Variantlar</h2>
        <VariantsSection productId={productId} variants={variants ?? []} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Rasmlar</h2>
        <ImagesSection productId={productId} images={images ?? []} />
      </div>
    </div>
  );
}

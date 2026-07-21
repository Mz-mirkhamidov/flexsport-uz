import "server-only";
import { createClient } from "@/lib/supabase/server";
import { curatedProducts, type CuratedCategory, type CuratedProduct } from "./curated-products";

export async function getCuratedProducts(): Promise<CuratedProduct[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id,slug,name,description,base_price,tags,categories(name,slug),product_images(url,sort_order)")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (!data?.length) return curatedProducts;
  return data.map((product) => {
    const fallback = curatedProducts.find((item) => item.slug === product.slug);
    const categoryTag = product.tags.find((tag) => tag.startsWith("collection:"))?.split(":")[1] as CuratedCategory | undefined;
    const categoryText = `${product.categories?.slug ?? ""} ${product.categories?.name ?? ""}`.toLocaleLowerCase("uz");
    const categoryFromCatalog: CuratedCategory =
      /butsa|oyoq|futzal/.test(categoryText) ? "butsa" :
      /forma|futbolka/.test(categoryText) ? "forma" :
      /to.p|ball/.test(categoryText) ? "top" :
      /fitness|trenaj|gant|dumbbell/.test(categoryText) ? "fitness" :
      /sumka|ryukzak|kiyim/.test(categoryText) ? "sumka" : "anjom";
    const image = [...product.product_images].sort((a,b) => a.sort_order-b.sort_order)[0]?.url;
    return {
      id: product.id,
      slug: product.slug,
      name: product.name,
      kicker: fallback?.kicker ?? "FlexSport premium kolleksiyasi",
      category: categoryTag ?? fallback?.category ?? categoryFromCatalog,
      price: product.base_price,
      image: image ?? fallback?.image ?? "/catalog/ball-match-black.webp",
      badge: fallback?.badge,
      description: product.description ?? fallback?.description ?? "Premium sport mahsuloti.",
    };
  });
}

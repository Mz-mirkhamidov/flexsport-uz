"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/admin";
import {
  productSchema,
  slugify,
  variantSchema,
} from "@/lib/validation/catalog";

export type ProductActionState = { error?: string } | null;

async function resolveBrandId(
  supabase: Awaited<ReturnType<typeof createClient>>,
  brandName?: string,
) {
  const trimmed = brandName?.trim();
  if (!trimmed) return null;

  const { data: existing } = await supabase
    .from("brands")
    .select("id")
    .eq("name", trimmed)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("brands")
    .insert({ name: trimmed, slug: slugify(trimmed) })
    .select("id")
    .single();
  if (error) throw error;
  return created.id;
}

function parseTags(raw?: string) {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

function productTags(formData: FormData, raw?: string) {
  const tags = parseTags(raw).filter((tag) => tag !== "premium-curated");
  if (formData.get("isPremium") === "on") tags.push("premium-curated");
  return tags;
}

export async function createProduct(
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    brandName: formData.get("brandName"),
    basePrice: formData.get("basePrice"),
    discountPct: formData.get("discountPct") || undefined,
    tags: formData.get("tags"),
    lowStockThreshold: formData.get("lowStockThreshold") || 5,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { supabase } = await requireAdmin();

  let brandId: string | null = null;
  try {
    brandId = await resolveBrandId(supabase, parsed.data.brandName);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Brend yaratib bo'lmadi" };
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name),
      description: parsed.data.description || null,
      category_id: parsed.data.categoryId,
      brand_id: brandId,
      base_price: parsed.data.basePrice,
      discount_pct: parsed.data.discountPct ?? null,
      tags: productTags(formData, parsed.data.tags),
      low_stock_threshold: parsed.data.lowStockThreshold,
      is_active: parsed.data.isActive,
    })
    .select("id")
    .single();
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  redirect(`/admin/products/${product.id}/edit`);
}

export async function updateProduct(
  productId: string,
  _prevState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    categoryId: formData.get("categoryId"),
    brandName: formData.get("brandName"),
    basePrice: formData.get("basePrice"),
    discountPct: formData.get("discountPct") || undefined,
    tags: formData.get("tags"),
    lowStockThreshold: formData.get("lowStockThreshold") || 5,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { supabase } = await requireAdmin();

  let brandId: string | null = null;
  try {
    brandId = await resolveBrandId(supabase, parsed.data.brandName);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Brend yaratib bo'lmadi" };
  }

  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name),
      description: parsed.data.description || null,
      category_id: parsed.data.categoryId,
      brand_id: brandId,
      base_price: parsed.data.basePrice,
      discount_pct: parsed.data.discountPct ?? null,
      tags: productTags(formData, parsed.data.tags),
      low_stock_threshold: parsed.data.lowStockThreshold,
      is_active: parsed.data.isActive,
    })
    .eq("id", productId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}/edit`);
  return null;
}

export async function deleteProduct(productId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/admin/products");
}

export type VariantActionState = { error?: string } | null;

export async function addVariant(
  productId: string,
  _prevState: VariantActionState,
  formData: FormData,
): Promise<VariantActionState> {
  const parsed = variantSchema.safeParse({
    size: formData.get("size"),
    color: formData.get("color"),
    price: formData.get("price") || undefined,
    stockQty: formData.get("stockQty") || 0,
    sku: formData.get("sku"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("product_variants").insert({
    product_id: productId,
    size: parsed.data.size || null,
    color: parsed.data.color || null,
    price: parsed.data.price ?? null,
    stock_qty: parsed.data.stockQty,
    sku: parsed.data.sku || null,
  });
  if (error) {
    return { error: error.message };
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  return null;
}

export async function updateVariantStock(
  variantId: string,
  productId: string,
  formData: FormData,
) {
  const stockQty = Number(formData.get("stockQty"));
  const { supabase } = await requireAdmin();
  await supabase
    .from("product_variants")
    .update({ stock_qty: Number.isFinite(stockQty) ? stockQty : 0 })
    .eq("id", variantId);

  const { data: variant } = await supabase
    .from("product_variants")
    .select("size, color, stock_qty, products(name, low_stock_threshold)")
    .eq("id", variantId)
    .single();
  if (variant?.products && variant.stock_qty <= variant.products.low_stock_threshold) {
    const { sendTelegramMessage } = await import("@/lib/telegram/bot");
    const { lowStockMessage } = await import("@/lib/telegram/templates");
    const label = [variant.size, variant.color].filter(Boolean).join(" / ") || null;
    await sendTelegramMessage(lowStockMessage(variant.products.name, label, variant.stock_qty));
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  revalidatePath("/admin/inventory");
}

export async function deleteVariant(variantId: string, productId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("product_variants").delete().eq("id", variantId);
  revalidatePath(`/admin/products/${productId}/edit`);
}

export async function deleteProductImage(imageId: string, productId: string) {
  const { supabase } = await requireAdmin();
  const { data: image } = await supabase
    .from("product_images")
    .select("url")
    .eq("id", imageId)
    .single();

  await supabase.from("product_images").delete().eq("id", imageId);

  if (image?.url) {
    const path = image.url.split("/product-images/")[1];
    if (path) {
      await supabase.storage.from("product-images").remove([path]);
    }
  }

  revalidatePath(`/admin/products/${productId}/edit`);
}

export type UploadImageState = { error?: string } | null;

export async function uploadProductImage(
  productId: string,
  _prevState: UploadImageState,
  formData: FormData,
): Promise<UploadImageState> {
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Rasm tanlanmagan" };
  }

  const { supabase } = await requireAdmin();
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${productId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type });
  if (uploadError) {
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);

  const { count } = await supabase
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("product_id", productId);

  const { error: insertError } = await supabase.from("product_images").insert({
    product_id: productId,
    url: publicUrl,
    sort_order: count ?? 0,
  });
  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/admin/products/${productId}/edit`);
  return null;
}

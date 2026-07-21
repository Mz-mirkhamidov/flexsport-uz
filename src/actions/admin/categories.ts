"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { categorySchema, slugify } from "@/lib/validation/catalog";

export type CategoryActionState = { error?: string } | null;

export async function createCategory(
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    parentId: formData.get("parentId"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data.name,
    slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name),
    parent_id: parsed.data.parentId || null,
    sort_order: parsed.data.sortOrder,
    is_active: parsed.data.isActive,
  });
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return null;
}

export async function updateCategory(
  categoryId: string,
  _prevState: CategoryActionState,
  formData: FormData,
): Promise<CategoryActionState> {
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    parentId: formData.get("parentId"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: formData.get("isActive") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { supabase } = await requireAdmin();
  const { error } = await supabase
    .from("categories")
    .update({
      name: parsed.data.name,
      slug: parsed.data.slug ? slugify(parsed.data.slug) : slugify(parsed.data.name),
      parent_id: parsed.data.parentId || null,
      sort_order: parsed.data.sortOrder,
      is_active: parsed.data.isActive,
    })
    .eq("id", categoryId);
  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
  return null;
}

export async function deleteCategory(categoryId: string) {
  const { supabase } = await requireAdmin();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/admin/categories");
  revalidatePath("/", "layout");
}

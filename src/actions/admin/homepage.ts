"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth/admin";

export type HomepageActionState = { error?: string; success?: string } | null;

const safeLink = z.string().trim().startsWith("/", "Havola / belgisi bilan boshlanishi kerak");
const commonImage = {
  imageUrl: z.string().trim().min(1),
  imageAlt: z.string().trim().min(2, "Rasm tavsifini kiriting"),
};

const sectionSchemas = {
  hero: z.object({
    titleTop: z.string().trim().min(2),
    titleAccent: z.string().trim().min(2),
    subtitle: z.string().trim().min(2),
    ctaLabel: z.string().trim().min(2),
    ctaHref: safeLink,
    ...commonImage,
  }),
  "featured-campaign": z.object({
    eyebrow: z.string().trim().min(1),
    heading: z.string().trim().min(2),
    description: z.string().trim().min(2),
    priceLabel: z.string().trim().min(1),
    ctaLabel: z.string().trim().min(2),
    ctaHref: safeLink,
    ...commonImage,
  }),
  "sport-finder": z.object({
    eyebrow: z.string().trim().min(1),
    heading: z.string().trim().min(2),
    description: z.string().trim().min(2),
  }),
} as const;

async function uploadSectionImage(
  supabase: Awaited<ReturnType<typeof requireAdmin>>["supabase"],
  sectionKey: string,
  file: File,
) {
  if (!file.type.startsWith("image/")) throw new Error("Faqat rasm fayli yuklash mumkin");
  if (file.size > 10 * 1024 * 1024) throw new Error("Rasm hajmi 10 MB dan oshmasligi kerak");

  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `homepage/${sectionKey}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from("site-media").upload(path, file, {
    contentType: file.type,
    cacheControl: "3600",
  });
  if (error) throw error;
  return supabase.storage.from("site-media").getPublicUrl(path).data.publicUrl;
}

export async function publishHomepageSection(
  _previousState: HomepageActionState,
  formData: FormData,
): Promise<HomepageActionState> {
  const sectionKey = String(formData.get("sectionKey") ?? "") as keyof typeof sectionSchemas;
  const schema = sectionSchemas[sectionKey];
  if (!schema) return { error: "Noma’lum bosh sahifa bo‘limi" };

  const { supabase, user } = await requireAdmin();
  const { data: page, error: pageError } = await supabase
    .from("site_pages")
    .select("id")
    .eq("slug", "homepage")
    .single();
  if (pageError || !page) return { error: "Bosh sahifa sozlamasi topilmadi" };

  const raw = Object.fromEntries(
    [...formData.entries()]
      .filter(([key, value]) => key !== "sectionKey" && key !== "image" && typeof value === "string")
      .map(([key, value]) => [key, value]),
  );

  const image = formData.get("image");
  if (image instanceof File && image.size > 0) {
    try {
      raw.imageUrl = await uploadSectionImage(supabase, sectionKey, image);
    } catch (error) {
      return { error: error instanceof Error ? error.message : "Rasm yuklanmadi" };
    }
  }

  const parsed = schema.safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Maydonlarni tekshiring" };

  const { data: before } = await supabase
    .from("site_sections")
    .select("id, published_content")
    .eq("page_id", page.id)
    .eq("section_key", sectionKey)
    .single();
  if (!before) return { error: "Tahrirlanadigan bo‘lim topilmadi" };

  const { error } = await supabase
    .from("site_sections")
    .update({
      draft_content: parsed.data,
      published_content: parsed.data,
      updated_by: user.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", before.id);
  if (error) return { error: error.message };

  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: "homepage_section_published",
    entity_type: "site_section",
    entity_id: before.id,
    before_data: before.published_content,
    after_data: parsed.data,
  });

  revalidatePath("/");
  revalidatePath("/admin/storefront");
  return { success: "O‘zgarish saytda e’lon qilindi" };
}

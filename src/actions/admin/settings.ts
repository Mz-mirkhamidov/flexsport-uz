"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDeliveryZoneFee(zoneId: string, formData: FormData) {
  const fee = Number(formData.get("fee"));
  const supabase = await createClient();
  await supabase
    .from("delivery_zones")
    .update({ fee: Number.isFinite(fee) ? fee : 0 })
    .eq("id", zoneId);
  revalidatePath("/admin/settings");
}

export type SettingsActionState = { error?: string; success?: boolean } | null;

export async function updateContactInfo(
  _prevState: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  const supabase = await createClient();
  const { error } = await supabase.from("settings").upsert({
    key: "contact_info",
    value: {
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      instagram: String(formData.get("instagram") ?? ""),
      telegram: String(formData.get("telegram") ?? ""),
    },
    updated_at: new Date().toISOString(),
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/settings");
  return { success: true };
}

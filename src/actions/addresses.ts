"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addressSchema } from "@/lib/validation/checkout";

export type AddressActionState = { error?: string } | null;

export async function createAddress(
  _prevState: AddressActionState,
  formData: FormData,
): Promise<AddressActionState> {
  const parsed = addressSchema.safeParse({
    label: formData.get("label") || undefined,
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    region: formData.get("region"),
    city: formData.get("city"),
    addressLine: formData.get("addressLine"),
    deliveryZoneId: formData.get("deliveryZoneId"),
    isDefault: formData.get("isDefault") === "on",
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Kirish talab qilinadi" };

  if (parsed.data.isDefault) {
    await supabase
      .from("addresses")
      .update({ is_default: false })
      .eq("user_id", user.id);
  }

  const { error } = await supabase.from("addresses").insert({
    user_id: user.id,
    label: parsed.data.label || null,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    region: parsed.data.region,
    city: parsed.data.city,
    address_line: parsed.data.addressLine,
    delivery_zone_id: parsed.data.deliveryZoneId,
    is_default: parsed.data.isDefault,
  });
  if (error) return { error: error.message };

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  return null;
}

export async function deleteAddress(addressId: string) {
  const supabase = await createClient();
  await supabase.from("addresses").delete().eq("id", addressId);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

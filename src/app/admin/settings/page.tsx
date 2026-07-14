import { createClient } from "@/lib/supabase/server";
import { updateDeliveryZoneFee } from "@/actions/admin/settings";
import { ContactInfoForm } from "@/components/admin/ContactInfoForm";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [{ data: zones }, { data: contactSetting }] = await Promise.all([
    supabase.from("delivery_zones").select("*").order("name"),
    supabase.from("settings").select("value").eq("key", "contact_info").maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="text-2xl font-bold">Sozlamalar</h1>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Yetkazib berish narxlari</h2>
        <div className="flex flex-col gap-3">
          {(zones ?? []).map((z) => (
            <form
              key={z.id}
              action={updateDeliveryZoneFee.bind(null, z.id)}
              className="flex items-center gap-3 rounded border border-black/10 p-3 text-sm"
            >
              <span className="w-48 font-medium">{z.name}</span>
              <input
                type="number"
                name="fee"
                defaultValue={z.fee}
                min={0}
                className="w-32 rounded border border-black/20 px-2 py-1"
              />
              <span className="text-black/50">so&apos;m</span>
              <button type="submit" className="ml-auto text-xs text-black/60 hover:underline">
                Saqlash
              </button>
            </form>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">Kontakt ma&apos;lumotlari</h2>
        <div className="max-w-md">
          <ContactInfoForm
            value={
              (contactSetting?.value as {
                phone?: string;
                email?: string;
                instagram?: string;
                telegram?: string;
              }) ?? {}
            }
          />
        </div>
      </div>
    </div>
  );
}

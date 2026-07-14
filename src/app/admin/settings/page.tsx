import { createClient } from "@/lib/supabase/server";
import { updateDeliveryZoneFee } from "@/actions/admin/settings";
import { ContactInfoForm } from "@/components/admin/ContactInfoForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { Card, CardHeader } from "@/components/admin/ui/Card";
import { Input } from "@/components/admin/ui/Field";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const [{ data: zones }, { data: contactSetting }] = await Promise.all([
    supabase.from("delivery_zones").select("*").order("name"),
    supabase.from("settings").select("value").eq("key", "contact_info").maybeSingle(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <PageHeader title="Sozlamalar" />

      <div>
        <CardHeader title="Yetkazib berish narxlari" />
        <div className="flex flex-col gap-3">
          {(zones ?? []).map((z) => (
            <form
              key={z.id}
              action={updateDeliveryZoneFee.bind(null, z.id)}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm"
            >
              <span className="w-48 font-medium text-gray-900">{z.name}</span>
              <Input type="number" name="fee" defaultValue={z.fee} min={0} className="w-32" />
              <span className="text-gray-400">so&apos;m</span>
              <button
                type="submit"
                className="ml-auto text-xs font-medium text-gray-500 hover:text-gray-900"
              >
                Saqlash
              </button>
            </form>
          ))}
        </div>
      </div>

      <div>
        <CardHeader title="Kontakt ma'lumotlari" />
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

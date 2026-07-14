import { createClient } from "@/lib/supabase/server";
import { deleteAddress } from "@/actions/addresses";
import { AddressForm } from "@/components/storefront/AddressForm";
import { DeleteButton } from "@/components/admin/DeleteButton";

export default async function AccountAddressesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data: addresses }, { data: zones }] = await Promise.all([
    supabase
      .from("addresses")
      .select("*, delivery_zones(name, fee)")
      .eq("user_id", user!.id)
      .order("created_at", { ascending: false }),
    supabase.from("delivery_zones").select("*").eq("is_active", true),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold">Manzillar</h1>
        <div className="mt-4 flex flex-col gap-3">
          {(addresses ?? []).map((a) => (
            <div key={a.id} className="rounded border border-black/10 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {a.full_name} {a.is_default && "(asosiy)"}
                </span>
                <DeleteButton
                  action={deleteAddress.bind(null, a.id)}
                  confirmMessage="Manzilni o'chirasizmi?"
                />
              </div>
              <p className="text-black/60">
                {a.phone} — {a.region}, {a.city}, {a.address_line}
              </p>
              <p className="text-xs text-black/40">
                {a.delivery_zones?.name}
              </p>
            </div>
          ))}
          {(addresses ?? []).length === 0 && (
            <p className="text-black/60">Hozircha manzil qo&apos;shilmagan.</p>
          )}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold text-black/60">
          Yangi manzil
        </h2>
        <AddressForm zones={zones ?? []} />
      </div>
    </div>
  );
}

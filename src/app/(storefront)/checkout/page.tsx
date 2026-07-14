import { createClient } from "@/lib/supabase/server";
import { CheckoutClient } from "@/components/storefront/CheckoutClient";

export default async function CheckoutPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*, delivery_zones(*)")
    .eq("user_id", user!.id)
    .order("is_default", { ascending: false });

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Buyurtma rasmiylashtirish</h1>
      <CheckoutClient addresses={addresses ?? []} />
    </div>
  );
}

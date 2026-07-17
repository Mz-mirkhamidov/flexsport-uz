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
    <div className="checkout-page">
      <div className="catalog-title"><span>XAVFSIZ TO‘LOV</span><h1>Buyurtma</h1><p>Manzil va buyurtma tarkibini tekshiring</p></div>
      <CheckoutClient addresses={addresses ?? []} />
    </div>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderId } = await searchParams;
  const supabase = await createClient();

  const { data: order } = orderId
    ? await supabase
        .from("orders")
        .select("order_number, product_payment_status")
        .eq("id", orderId)
        .maybeSingle()
    : { data: null };

  const paid = order?.product_payment_status === "paid";

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="text-5xl">{paid ? "✅" : "⏳"}</div>
      <h1 className="mt-4 text-2xl font-bold">
        {paid ? "Buyurtma qabul qilindi" : "To'lov tekshirilmoqda"}
      </h1>
      {order && (
        <p className="mt-2 text-black/60">Buyurtma raqami: {order.order_number}</p>
      )}
      <p className="mt-4 text-sm text-black/50">
        {paid
          ? "Tez orada operatorlarimiz siz bilan bog'lanadi."
          : "To'lov holati bir necha daqiqada yangilanadi. Buyurtmalar tarixidan holatni kuzatishingiz mumkin."}
      </p>
      <Link
        href="/account/orders"
        className="mt-6 inline-block rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-[#8DC63F]"
      >
        Buyurtmalarim
      </Link>
    </div>
  );
}

import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MockPayButton } from "@/components/storefront/MockPayButton";

export default async function MockPayPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  if (process.env.PAYME_MERCHANT_ID) notFound();

  const { order: orderId } = await searchParams;
  if (!orderId) notFound();

  const supabase = await createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("order_number, product_amount")
    .eq("id", orderId)
    .single();
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="rounded border-2 border-dashed border-[#8DC63F] p-6">
        <p className="text-xs font-semibold uppercase text-[#8DC63F]">
          Test rejimi — haqiqiy Payme emas
        </p>
        <h1 className="mt-2 text-xl font-bold">To&apos;lovni simulyatsiya qilish</h1>
        <p className="mt-2 text-black/60">Buyurtma № {order.order_number}</p>
        <p className="mt-1 text-2xl font-bold">
          {new Intl.NumberFormat("uz-UZ").format(Number(order.product_amount))} so&apos;m
        </p>
        <MockPayButton orderId={orderId} />
      </div>
    </div>
  );
}

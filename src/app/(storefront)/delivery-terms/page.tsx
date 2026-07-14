import { createClient } from "@/lib/supabase/server";

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export default async function DeliveryTermsPage() {
  const supabase = await createClient();
  const { data: zones } = await supabase
    .from("delivery_zones")
    .select("*")
    .eq("is_active", true);

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">Yetkazib berish va to&apos;lov shartlari</h1>

      <div className="mt-6 flex flex-col gap-4 text-sm leading-relaxed text-black/70">
        <p>
          <strong>Toshkent shahri:</strong> Buyurtma tasdiqlangandan so&apos;ng
          24 soat ichida kuryer orqali yetkazib beriladi.
        </p>
        <p>
          <strong>Viloyatlar:</strong> O&apos;zbekiston Pochtasi orqali
          yuboriladi, yetkazib berish muddati mintaqaga qarab 2-7 kunni
          tashkil qiladi.
        </p>

        <div className="mt-4 overflow-hidden rounded border border-black/10">
          <table className="w-full">
            <thead className="bg-black/5 text-left">
              <tr>
                <th className="px-4 py-2">Yetkazib berish turi</th>
                <th className="px-4 py-2">Narxi</th>
              </tr>
            </thead>
            <tbody>
              {(zones ?? []).map((z) => (
                <tr key={z.id} className="border-t border-black/10">
                  <td className="px-4 py-2">{z.name}</td>
                  <td className="px-4 py-2">{formatPrice(z.fee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4">
          <strong>To&apos;lov:</strong> Mahsulot narxi buyurtma berish
          jarayonida Payme orqali oldindan to&apos;lanadi. Yetkazib berish
          puli kuryer yoki pochta xodimiga naqd pulda to&apos;lanadi.
        </p>
      </div>
    </div>
  );
}

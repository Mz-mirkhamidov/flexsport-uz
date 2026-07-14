import Link from "next/link";

export default function CheckoutFailedPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center">
      <div className="text-5xl">❌</div>
      <h1 className="mt-4 text-2xl font-bold">To&apos;lov amalga oshmadi</h1>
      <p className="mt-4 text-sm text-black/50">
        Buyurtmangiz saqlanib qoldi, lekin to&apos;lov yakunlanmadi. Qaytadan
        urinib ko&apos;ring yoki savatga qaytib boshqa usulni tanlang.
      </p>
      <Link
        href="/cart"
        className="mt-6 inline-block rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-[#8DC63F]"
      >
        Savatga qaytish
      </Link>
    </div>
  );
}

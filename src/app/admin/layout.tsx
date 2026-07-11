import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-full">
      <aside className="w-56 shrink-0 border-r border-black/10 bg-black text-white">
        <div className="px-4 py-5 text-lg font-bold">
          FLEX<span className="text-[#8DC63F]">SPORT</span> Admin
        </div>
        <nav className="flex flex-col gap-1 px-2 text-sm">
          <Link href="/admin" className="rounded px-3 py-2 hover:bg-white/10">
            Dashboard
          </Link>
          <Link
            href="/admin/products"
            className="rounded px-3 py-2 hover:bg-white/10"
          >
            Mahsulotlar
          </Link>
          <Link
            href="/admin/categories"
            className="rounded px-3 py-2 hover:bg-white/10"
          >
            Kategoriyalar
          </Link>
          <Link
            href="/admin/orders"
            className="rounded px-3 py-2 hover:bg-white/10"
          >
            Buyurtmalar
          </Link>
          <Link
            href="/admin/inventory"
            className="rounded px-3 py-2 hover:bg-white/10"
          >
            Ombor
          </Link>
          <Link
            href="/admin/discounts"
            className="rounded px-3 py-2 hover:bg-white/10"
          >
            Skidkalar
          </Link>
          <Link
            href="/admin/settings"
            className="rounded px-3 py-2 hover:bg-white/10"
          >
            Sozlamalar
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-black/[.02] p-6">{children}</main>
    </div>
  );
}

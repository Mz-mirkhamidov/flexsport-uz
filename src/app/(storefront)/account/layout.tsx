import Link from "next/link";

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-4 py-10">
      <aside className="w-48 shrink-0">
        <nav className="flex flex-col gap-1 text-sm">
          <Link href="/account" className="rounded px-3 py-2 hover:bg-black/5">
            Profil
          </Link>
          <Link
            href="/account/orders"
            className="rounded px-3 py-2 hover:bg-black/5"
          >
            Buyurtmalarim
          </Link>
          <Link
            href="/account/wishlist"
            className="rounded px-3 py-2 hover:bg-black/5"
          >
            Sevimlilar
          </Link>
          <Link
            href="/account/addresses"
            className="rounded px-3 py-2 hover:bg-black/5"
          >
            Manzillar
          </Link>
        </nav>
      </aside>
      <div className="flex-1">{children}</div>
    </div>
  );
}

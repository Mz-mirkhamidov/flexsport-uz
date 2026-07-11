import Link from "next/link";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/10 bg-black text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link href="/" className="text-xl font-bold tracking-tight">
            FLEX<span className="text-[#8DC63F]">SPORT</span>
          </Link>
          <nav className="hidden gap-6 text-sm font-medium md:flex">
            <Link href="/" className="hover:text-[#8DC63F]">
              Bosh sahifa
            </Link>
            <Link href="/search" className="hover:text-[#8DC63F]">
              Qidiruv
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-sm font-medium">
            <Link href="/login" className="hover:text-[#8DC63F]">
              Kirish
            </Link>
            <Link href="/cart" className="hover:text-[#8DC63F]">
              Savat
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-black/10 bg-black text-white/70">
        <div className="mx-auto max-w-6xl px-4 py-10 text-sm">
          <p>&copy; {new Date().getFullYear()} Flexsport.uz — barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </>
  );
}

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/actions/auth";
import { CartBadge } from "@/components/storefront/CartBadge";

export default async function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
            <Link
              href="/search"
              aria-label="Qidiruv"
              className="hover:text-[#8DC63F] md:hidden"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </Link>
            {user ? (
              <>
                <Link href="/account" className="hover:text-[#8DC63F]">
                  Kabinet
                </Link>
                <form action={logout}>
                  <button type="submit" className="hover:text-[#8DC63F]">
                    Chiqish
                  </button>
                </form>
              </>
            ) : (
              <Link href="/login" className="hover:text-[#8DC63F]">
                Kirish
              </Link>
            )}
            <CartBadge />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-black/10 bg-black text-white/70">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm">
          <nav className="flex flex-wrap gap-4">
            <Link href="/about" className="hover:text-white">
              Biz haqimizda
            </Link>
            <Link href="/delivery-terms" className="hover:text-white">
              Yetkazib berish shartlari
            </Link>
            <Link href="/return-policy" className="hover:text-white">
              Qaytarish siyosati
            </Link>
            <Link href="/contact" className="hover:text-white">
              Aloqa
            </Link>
          </nav>
          <p>&copy; {new Date().getFullYear()} Flexsport.uz — barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </>
  );
}

import Link from "next/link";
import { Heart, House, List, MagnifyingGlass, ShoppingBag, SquaresFour, User } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/actions/auth";
import { CartBadge } from "@/components/storefront/CartBadge";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <>
      <header className="premium-header">
        <div className="premium-header-row">
          <Link href="/search" className="menu-trigger" aria-label="Katalogni ochish"><List weight="bold" /></Link>
          <Link href="/" className="premium-brand" aria-label="FlexSport bosh sahifa">FLE<span>X</span>SPORT</Link>
          <div className="premium-header-actions">
            <Link href="/account/wishlist" aria-label="Sevimlilar"><Heart /></Link>
            <CartBadge />
          </div>
        </div>
        <form action="/search" className="header-search">
          <MagnifyingGlass aria-hidden="true" />
          <input name="q" placeholder="Qidirish" aria-label="Mahsulot qidirish" />
        </form>
        <nav className="desktop-premium-nav" aria-label="Asosiy navigatsiya">
          <Link href="/search">Katalog</Link><Link href="/search?category=butsa">Futbol</Link><Link href="/search?category=fitness">Fitness</Link><Link href="/about">Biz haqimizda</Link>
          {user ? <form action={logout}><button type="submit">Chiqish</button></form> : <Link href="/login">Kirish</Link>}
        </nav>
      </header>
      <main>{children}</main>
      <nav className="premium-mobile-dock" aria-label="Mobil navigatsiya">
        <Link href="/"><House weight="bold" /><small>Bosh sahifa</small></Link>
        <Link href="/search"><SquaresFour /><small>Katalog</small></Link>
        <Link href="/account/wishlist"><Heart /><small>Sevimlilar</small></Link>
        <Link href="/account"><User /><small>Profil</small></Link>
        <Link href="/cart"><ShoppingBag /><small>Savat</small></Link>
      </nav>
      <footer className="premium-footer">
        <Link href="/" className="premium-brand">FLE<span>X</span>SPORT</Link>
        <p>Sport va faol hayot uchun premium onlayn do‘kon.</p>
        <div><Link href="/delivery-terms">Yetkazib berish</Link><Link href="/return-policy">Qaytarish</Link><Link href="/contact">Aloqa</Link></div>
        <small>© {new Date().getFullYear()} FlexSport Uzbekistan</small>
      </footer>
    </>
  );
}

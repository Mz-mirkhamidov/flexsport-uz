import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/actions/auth";
import { CartBadge } from "@/components/storefront/CartBadge";

export default async function StorefrontLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <>
      <div className="announcement">BEPUL YETKAZIB BERISH — 500 000 SO‘MDAN YUQORI BUYURTMALAR UCHUN <span>•</span> 100% ORIGINAL MAHSULOTLAR</div>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="FlexSport bosh sahifa">FLEX<span>SPORT</span><i>.</i></Link>
          <nav className="main-nav" aria-label="Asosiy navigatsiya">
            <Link href="/">Bosh sahifa</Link><Link href="/search">Katalog</Link><Link href="/#categories">Kategoriyalar</Link><Link href="/about">Biz haqimizda</Link>
          </nav>
          <div className="header-actions">
            <Link href="/search" aria-label="Qidiruv" className="icon-link">⌕</Link>
            {user ? <><Link href="/account">Kabinet</Link><form action={logout}><button type="submit">Chiqish</button></form></> : <Link href="/login">Kirish</Link>}
            <CartBadge />
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <nav className="mobile-dock" aria-label="Mobil navigatsiya">
        <Link href="/"><span>⌂</span><small>Bosh sahifa</small></Link>
        <Link href="/search"><span>⌕</span><small>Qidiruv</small></Link>
        <Link href="/#categories" className="dock-main"><span>＋</span><small>Katalog</small></Link>
        <Link href="/account/wishlist"><span>♡</span><small>Sevimli</small></Link>
        <Link href="/cart"><span>▱</span><small>Savat</small></Link>
      </nav>
      <footer className="site-footer">
        <div className="footer-grid">
          <div><Link href="/" className="brand">FLEX<span>SPORT</span><i>.</i></Link><p>Sport va faol hayot uchun kerak bo‘lgan barcha mahsulotlar — bitta ishonchli manzilda.</p></div>
          <div><h3>Do‘kon</h3><Link href="/search">Katalog</Link><Link href="/#categories">Kategoriyalar</Link><Link href="/cart">Savat</Link></div>
          <div><h3>Yordam</h3><Link href="/delivery-terms">Yetkazib berish</Link><Link href="/return-policy">Qaytarish siyosati</Link><Link href="/contact">Aloqa</Link></div>
          <div><h3>Yangiliklardan xabardor bo‘ling</h3><p>Yangi mahsulotlar va maxsus takliflar.</p><Link className="footer-cta" href="/register">Club’ga qo‘shilish →</Link></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Flexsport.uz</span><span>Toshkent, O‘zbekiston</span></div>
      </footer>
    </>
  );
}

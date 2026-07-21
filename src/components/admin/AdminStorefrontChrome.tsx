import Link from "next/link";
import {
  ChartBar,
  House,
  List,
  MagnifyingGlass,
  Package,
  Pulse,
  SquaresFour,
} from "@phosphor-icons/react/dist/ssr";

export function AdminStorefrontChrome({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="premium-header admin-premium-header">
        <div className="premium-header-row">
          <Link href="/admin/products" className="menu-trigger" aria-label="Admin katalogni ochish">
            <List weight="bold" />
          </Link>
          <Link href="/admin/storefront" className="premium-brand" aria-label="Admin bosh sahifa">
            FLE<span>X</span>SPORT
          </Link>
          <Link href="/admin" className="admin-header-dashboard" aria-label="Dashboard">
            <ChartBar weight="bold" />
          </Link>
        </div>
        <form action="/admin/products" className="header-search">
          <MagnifyingGlass aria-hidden="true" />
          <input name="q" placeholder="Mahsulotlarni boshqarish" aria-label="Mahsulot qidirish" />
        </form>
        <nav className="desktop-premium-nav" aria-label="Admin navigatsiya">
          <Link href="/admin/storefront">Bosh sahifa</Link>
          <Link href="/admin/products">Katalog</Link>
          <Link href="/admin/orders">Harakatlar</Link>
          <Link href="/admin">Dashboard</Link>
          <Link href="/admin/inventory">Ombor</Link>
        </nav>
      </header>
      <main>{children}</main>
      <nav className="premium-mobile-dock admin-mobile-dock" aria-label="Admin mobil navigatsiya">
        <Link href="/admin/storefront"><House weight="bold" /><small>Bosh sahifa</small></Link>
        <Link href="/admin/products"><SquaresFour /><small>Katalog</small></Link>
        <Link href="/admin/orders"><Pulse /><small>Harakatlar</small></Link>
        <Link href="/admin"><ChartBar /><small>Dashboard</small></Link>
        <Link href="/admin/inventory"><Package /><small>Ombor</small></Link>
      </nav>
    </>
  );
}

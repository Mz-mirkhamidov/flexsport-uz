import Link from "next/link";
import {
  ChartBar,
  List,
  MagnifyingGlass,
} from "@phosphor-icons/react/dist/ssr";
import { AdminDesktopNav, AdminMobileDock } from "./AdminStorefrontNav";

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
        <AdminDesktopNav />
      </header>
      <main>{children}</main>
      <AdminMobileDock />
    </>
  );
}

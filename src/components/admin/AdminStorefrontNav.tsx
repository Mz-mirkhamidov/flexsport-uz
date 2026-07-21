"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartBar, House, Package, Pulse, SquaresFour } from "@phosphor-icons/react";

const items = [
  { href: "/admin/storefront", label: "Bosh sahifa", icon: House, exact: true },
  { href: "/admin/products", label: "Katalog", icon: SquaresFour },
  { href: "/admin/orders", label: "Harakatlar", icon: Pulse },
  { href: "/admin", label: "Dashboard", icon: ChartBar, exact: true },
  { href: "/admin/inventory", label: "Ombor", icon: Package },
];

function isCurrent(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminDesktopNav() {
  const pathname = usePathname();
  return <nav className="desktop-premium-nav admin-desktop-nav" aria-label="Admin navigatsiya">{items.map(({ href, label, exact }) => <Link key={href} href={href} className={isCurrent(pathname, href, exact) ? "active" : undefined}>{label}</Link>)}</nav>;
}

export function AdminMobileDock() {
  const pathname = usePathname();
  return <nav className="premium-mobile-dock admin-mobile-dock" aria-label="Admin mobil navigatsiya">{items.map(({ href, label, icon: Icon, exact }) => { const active = isCurrent(pathname, href, exact); return <Link key={href} href={href} className={active ? "active" : undefined} aria-current={active ? "page" : undefined}><Icon weight={active ? "fill" : "regular"} /><small>{label}</small></Link>; })}</nav>;
}

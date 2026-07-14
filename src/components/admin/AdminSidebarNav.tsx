"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CategoriesIcon,
  DashboardIcon,
  DiscountsIcon,
  InventoryIcon,
  OrdersIcon,
  ProductsIcon,
  ReviewsIcon,
  SettingsIcon,
} from "@/components/admin/ui/icons";

const NAV_ITEMS = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon, exact: true },
  { href: "/admin/products", label: "Mahsulotlar", icon: ProductsIcon },
  { href: "/admin/categories", label: "Kategoriyalar", icon: CategoriesIcon },
  { href: "/admin/orders", label: "Buyurtmalar", icon: OrdersIcon },
  { href: "/admin/inventory", label: "Ombor", icon: InventoryIcon },
  { href: "/admin/discounts", label: "Skidkalar", icon: DiscountsIcon },
  { href: "/admin/reviews", label: "Sharhlar", icon: ReviewsIcon },
  { href: "/admin/settings", label: "Sozlamalar", icon: SettingsIcon },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-0.5 px-3">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              isActive
                ? "bg-[#8DC63F] text-gray-950"
                : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

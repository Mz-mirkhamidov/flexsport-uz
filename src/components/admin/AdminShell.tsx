"use client";

import { usePathname } from "next/navigation";

export function AdminShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isVisualWorkspace =
    pathname === "/admin/storefront" || pathname === "/admin/products";

  if (isVisualWorkspace) {
    return <div className="admin-visual-workspace">{children}</div>;
  }

  return (
    <div className="flex min-h-full flex-col bg-gray-50 md:flex-row">
      {sidebar}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8">{children}</main>
    </div>
  );
}

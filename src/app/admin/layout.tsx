import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/actions/auth";
import { AdminSidebarNav } from "@/components/admin/AdminSidebarNav";
import { LogoutIcon, StorefrontIcon } from "@/components/admin/ui/icons";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .single()
    : { data: null };

  return (
    <div className="flex min-h-full bg-gray-50">
      <aside className="flex w-64 shrink-0 flex-col bg-gray-950">
        <div className="px-5 py-6">
          <Link href="/admin" className="text-lg font-bold text-white">
            FLEX<span className="text-[#8DC63F]">SPORT</span>
          </Link>
          <p className="mt-0.5 text-xs text-gray-500">Admin panel</p>
        </div>
        <div className="flex-1 overflow-y-auto pb-4">
          <AdminSidebarNav />
        </div>
        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#8DC63F]/20 text-sm font-semibold text-[#8DC63F]">
              {(profile?.full_name ?? profile?.email ?? "A").charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {profile?.full_name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-gray-500">{profile?.email}</p>
            </div>
          </div>
          <div className="mt-1 flex flex-col gap-0.5">
            <Link
              href="/"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-white/5 hover:text-white"
            >
              <StorefrontIcon className="h-4 w-4" />
              Saytni ko&apos;rish
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-gray-400 hover:bg-white/5 hover:text-white"
              >
                <LogoutIcon className="h-4 w-4" />
                Chiqish
              </button>
            </form>
          </div>
        </div>
      </aside>
      <main className="flex-1 overflow-x-hidden p-8">{children}</main>
    </div>
  );
}

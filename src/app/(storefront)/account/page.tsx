import { createClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone")
    .eq("id", user!.id)
    .single();

  return (
    <div>
      <h1 className="text-2xl font-bold">Profil</h1>
      <dl className="mt-4 flex flex-col gap-2 text-sm">
        <div className="flex gap-2">
          <dt className="w-24 text-black/50">Ism</dt>
          <dd>{profile?.full_name ?? "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 text-black/50">Email</dt>
          <dd>{profile?.email ?? "—"}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-24 text-black/50">Telefon</dt>
          <dd>{profile?.phone ?? "—"}</dd>
        </div>
      </dl>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";

type ContactInfo = {
  phone?: string;
  email?: string;
  instagram?: string;
  telegram?: string;
};

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: setting } = await supabase
    .from("settings")
    .select("value")
    .eq("key", "contact_info")
    .maybeSingle();

  const contact = (setting?.value as ContactInfo) ?? {};

  return (
    <div className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold">Aloqa</h1>
      <div className="mt-6 flex flex-col gap-3 text-sm text-black/70">
        <p>Savol yoki takliflaringiz bo&apos;lsa, biz bilan bog&apos;laning:</p>
        <dl className="mt-2 flex flex-col gap-2">
          {contact.phone && (
            <div className="flex gap-2">
              <dt className="w-24 text-black/50">Telefon</dt>
              <dd>{contact.phone}</dd>
            </div>
          )}
          {contact.email && (
            <div className="flex gap-2">
              <dt className="w-24 text-black/50">Email</dt>
              <dd>{contact.email}</dd>
            </div>
          )}
          {contact.instagram && (
            <div className="flex gap-2">
              <dt className="w-24 text-black/50">Instagram</dt>
              <dd>{contact.instagram}</dd>
            </div>
          )}
          {contact.telegram && (
            <div className="flex gap-2">
              <dt className="w-24 text-black/50">Telegram</dt>
              <dd>{contact.telegram}</dd>
            </div>
          )}
          {!contact.phone && !contact.email && !contact.instagram && !contact.telegram && (
            <p className="text-black/50">
              Kontakt ma&apos;lumotlari hali admin panelda to&apos;ldirilmagan.
            </p>
          )}
        </dl>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { updateContactInfo } from "@/actions/admin/settings";

type ContactInfo = {
  phone?: string;
  email?: string;
  instagram?: string;
  telegram?: string;
};

export function ContactInfoForm({ value }: { value: ContactInfo }) {
  const [state, formAction, pending] = useActionState(updateContactInfo, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded border border-black/10 p-4">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Telefon</label>
        <input
          name="phone"
          type="text"
          defaultValue={value.phone}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Email</label>
        <input
          name="email"
          type="email"
          defaultValue={value.email}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Instagram</label>
        <input
          name="instagram"
          type="text"
          defaultValue={value.instagram}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Telegram</label>
        <input
          name="telegram"
          type="text"
          defaultValue={value.telegram}
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>
      {state?.success && <p className="text-sm text-[#8DC63F]">Saqlandi</p>}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-[#8DC63F] disabled:opacity-60"
      >
        {pending ? "Saqlanmoqda..." : "Saqlash"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { updateContactInfo } from "@/actions/admin/settings";
import { FieldGroup, Input, Label } from "@/components/admin/ui/Field";
import { Button } from "@/components/admin/ui/Button";

type ContactInfo = {
  phone?: string;
  email?: string;
  instagram?: string;
  telegram?: string;
};

export function ContactInfoForm({ value }: { value: ContactInfo }) {
  const [state, formAction, pending] = useActionState(updateContactInfo, null);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm"
    >
      <FieldGroup>
        <Label>Telefon</Label>
        <Input name="phone" type="text" defaultValue={value.phone} />
      </FieldGroup>
      <FieldGroup>
        <Label>Email</Label>
        <Input name="email" type="email" defaultValue={value.email} />
      </FieldGroup>
      <FieldGroup>
        <Label>Instagram</Label>
        <Input name="instagram" type="text" defaultValue={value.instagram} />
      </FieldGroup>
      <FieldGroup>
        <Label>Telegram</Label>
        <Input name="telegram" type="text" defaultValue={value.telegram} />
      </FieldGroup>
      {state?.success && <p className="text-sm text-[#4d7a1a]">Saqlandi</p>}
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Saqlanmoqda..." : "Saqlash"}
        </Button>
      </div>
    </form>
  );
}

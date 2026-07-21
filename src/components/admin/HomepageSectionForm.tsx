"use client";

import { useActionState } from "react";
import { publishHomepageSection } from "@/actions/admin/homepage";
import { Button } from "@/components/admin/ui/Button";
import { Card } from "@/components/admin/ui/Card";
import { FieldGroup, Input, Label, Textarea } from "@/components/admin/ui/Field";

type Field = {
  name: string;
  label: string;
  value: string;
  kind?: "text" | "textarea";
  hint?: string;
};

export function HomepageSectionForm({
  sectionKey,
  title,
  description,
  fields,
  imageUrl,
}: {
  sectionKey: "hero" | "featured-campaign" | "sport-finder";
  title: string;
  description: string;
  fields: Field[];
  imageUrl?: string;
}) {
  const [state, action, pending] = useActionState(publishHomepageSection, null);

  return (
    <Card>
      <form action={action} className="flex flex-col gap-5">
        <input type="hidden" name="sectionKey" value={sectionKey} />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <span className="rounded-full bg-[#8DC63F]/15 px-3 py-1 text-xs font-medium text-[#4d7a1a]">
            Qalamcha
          </span>
        </div>

        {imageUrl && (
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-950">
            {/* Admin preview intentionally uses a regular image for arbitrary public CMS URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Joriy bo‘lim rasmi" className="h-48 w-full object-cover" />
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {fields.map((field) => (
            <FieldGroup key={field.name}>
              <Label htmlFor={`${sectionKey}-${field.name}`}>{field.label}</Label>
              {field.kind === "textarea" ? (
                <Textarea
                  id={`${sectionKey}-${field.name}`}
                  name={field.name}
                  rows={3}
                  defaultValue={field.value}
                />
              ) : (
                <Input
                  id={`${sectionKey}-${field.name}`}
                  name={field.name}
                  defaultValue={field.value}
                />
              )}
              {field.hint && <p className="text-xs text-gray-500">{field.hint}</p>}
            </FieldGroup>
          ))}
        </div>

        {imageUrl && (
          <>
            <input type="hidden" name="imageUrl" value={imageUrl} />
            <FieldGroup>
              <Label htmlFor={`${sectionKey}-image`}>Yangi rasm</Label>
              <Input
                id={`${sectionKey}-image`}
                name="image"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
              />
              <p className="text-xs text-gray-500">JPG, PNG, WebP yoki AVIF · ko‘pi bilan 10 MB</p>
            </FieldGroup>
          </>
        )}

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        {state?.success && <p className="text-sm text-green-700">{state.success}</p>}

        <div>
          <Button type="submit" disabled={pending}>
            {pending ? "E’lon qilinmoqda..." : "Saqlash va saytda e’lon qilish"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

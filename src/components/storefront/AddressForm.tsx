"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import { createAddress } from "@/actions/addresses";

export function AddressForm({ zones }: { zones: Tables<"delivery_zones">[] }) {
  const [state, formAction, pending] = useActionState(createAddress, null);

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded border border-black/10 p-4">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Ism familiya</label>
          <input
            name="fullName"
            type="text"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Telefon</label>
          <input
            name="phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Viloyat</label>
          <input
            name="region"
            type="text"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Shahar</label>
          <input
            name="city"
            type="text"
            required
            className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">To&apos;liq manzil</label>
        <input
          name="addressLine"
          type="text"
          required
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Yetkazib berish turi</label>
        <select
          name="deliveryZoneId"
          required
          className="rounded border border-black/20 px-3 py-2 text-sm outline-none focus:border-[#8DC63F]"
        >
          <option value="">Tanlang</option>
          {zones.map((z) => (
            <option key={z.id} value={z.id}>
              {z.name} — {new Intl.NumberFormat("uz-UZ").format(z.fee)} so&apos;m
            </option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isDefault" />
        Asosiy manzil sifatida saqlash
      </label>
      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="self-start rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-[#8DC63F] disabled:opacity-60"
      >
        {pending ? "Saqlanmoqda..." : "Manzil qo'shish"}
      </button>
    </form>
  );
}

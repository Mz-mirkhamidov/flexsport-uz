"use client";

import { useActionState } from "react";
import type { Tables } from "@/types/database.types";
import { createAddress } from "@/actions/addresses";

export function AddressForm({ zones }: { zones: Tables<"delivery_zones">[] }) {
  const [state, formAction, pending] = useActionState(createAddress, null);

  return (
    <form action={formAction} className="mobile-form-card">
      <div className="form-intro"><span>1-QADAM</span><h2>Yetkazib berish manzili</h2><p>Buyurtmangizni qayerga olib borishimizni kiriting.</p></div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Ism familiya</label>
          <input
            name="fullName"
            type="text"
            required
            autoComplete="name"
            className="mobile-input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Telefon</label>
          <input
            name="phone"
            type="tel"
            placeholder="+998 90 123 45 67"
            required
            inputMode="tel"
            autoComplete="tel"
            className="mobile-input"
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
            autoComplete="address-level1"
            className="mobile-input"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium">Shahar</label>
          <input
            name="city"
            type="text"
            required
            autoComplete="address-level2"
            className="mobile-input"
          />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">To&apos;liq manzil</label>
        <input
          name="addressLine"
          type="text"
          required
          autoComplete="street-address"
          className="mobile-input"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium">Yetkazib berish turi</label>
        <select
          name="deliveryZoneId"
          required
          className="mobile-input"
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
        className="form-primary-button"
      >
        {pending ? "Saqlanmoqda..." : "Manzil qo'shish"}
      </button>
    </form>
  );
}

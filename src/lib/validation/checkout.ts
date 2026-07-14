import { z } from "zod";

export const addressSchema = z.object({
  label: z.string().trim().optional(),
  fullName: z.string().trim().min(2, "Ism familiya kiriting"),
  phone: z.string().trim().min(7, "Telefon raqamni kiriting"),
  region: z.string().trim().min(2, "Viloyat/shaharni kiriting"),
  city: z.string().trim().min(2, "Shaharni kiriting"),
  addressLine: z.string().trim().min(4, "Manzilni to'liq kiriting"),
  deliveryZoneId: z.string().uuid("Yetkazib berish turini tanlang"),
  isDefault: z.coerce.boolean().default(false),
});

export const checkoutSchema = z.object({
  addressId: z.string().uuid("Manzilni tanlang"),
});

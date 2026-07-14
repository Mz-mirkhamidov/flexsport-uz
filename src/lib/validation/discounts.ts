import { z } from "zod";

export const discountSchema = z
  .object({
    scope: z.enum(["global", "category", "product"]),
    categoryId: z.string().uuid().optional().or(z.literal("")),
    productId: z.string().uuid().optional().or(z.literal("")),
    percent: z.coerce.number().min(1).max(100),
    startsAt: z.string().min(1, "Boshlanish sanasini kiriting"),
    endsAt: z.string().min(1, "Tugash sanasini kiriting"),
    isActive: z.coerce.boolean().default(true),
  })
  .refine(
    (data) => data.scope !== "category" || Boolean(data.categoryId),
    { message: "Kategoriya tanlang", path: ["categoryId"] },
  )
  .refine(
    (data) => data.scope !== "product" || Boolean(data.productId),
    { message: "Mahsulot tanlang", path: ["productId"] },
  )
  .refine((data) => new Date(data.endsAt) > new Date(data.startsAt), {
    message: "Tugash sanasi boshlanishdan keyin bo'lishi kerak",
    path: ["endsAt"],
  });

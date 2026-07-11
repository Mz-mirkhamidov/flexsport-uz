import { z } from "zod";

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export { slugify };

export const categorySchema = z.object({
  name: z.string().trim().min(2, "Nomi kamida 2 belgi"),
  slug: z.string().trim().optional(),
  parentId: z.string().uuid().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.coerce.boolean().default(true),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Nomi kamida 2 belgi"),
  slug: z.string().trim().optional(),
  description: z.string().trim().optional(),
  categoryId: z.string().uuid("Kategoriya tanlang"),
  brandName: z.string().trim().optional(),
  basePrice: z.coerce.number().min(0, "Narx manfiy bo'lmasligi kerak"),
  discountPct: z.coerce.number().min(0).max(100).optional(),
  tags: z.string().trim().optional(),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),
  isActive: z.coerce.boolean().default(true),
});

export const variantSchema = z.object({
  size: z.string().trim().optional(),
  color: z.string().trim().optional(),
  price: z.coerce.number().min(0).optional(),
  stockQty: z.coerce.number().int().min(0).default(0),
  sku: z.string().trim().optional(),
});

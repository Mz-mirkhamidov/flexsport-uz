import type { Database } from "@/types/database.types";

export type ProductStatus = Database["public"]["Enums"]["product_status"];

export const PRODUCT_STATUS_OPTIONS: Array<{
  value: ProductStatus;
  label: string;
  description: string;
}> = [
  { value: "draft", label: "Qoralama", description: "tayyorlanmoqda" },
  { value: "active", label: "Faol", description: "asosiy saytda ko‘rinadi" },
  {
    value: "hidden",
    label: "Yashirin",
    description: "to‘g‘ridan-to‘g‘ri havola orqali ochiladi",
  },
  { value: "archived", label: "Arxiv", description: "saytda umuman ko‘rinmaydi" },
];

export const PRODUCT_STATUS_LABEL = Object.fromEntries(
  PRODUCT_STATUS_OPTIONS.map(({ value, label }) => [value, label]),
) as Record<ProductStatus, string>;

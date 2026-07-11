import { z } from "zod";

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, "Ismingizni kiriting"),
  email: z.string().trim().email("Email noto'g'ri"),
  password: z.string().min(6, "Parol kamida 6 belgidan iborat bo'lishi kerak"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Email noto'g'ri"),
  password: z.string().min(1, "Parolni kiriting"),
});

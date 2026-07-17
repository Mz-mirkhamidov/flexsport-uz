"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register } from "@/actions/auth";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(register, null);

  return (
    <div className="auth-shell">
      <div className="auth-kicker">YANGI HISOB / 01</div>
      <h1>Ro&apos;yxatdan o&apos;tish</h1><p className="auth-intro">Tezkor checkout va buyurtma holatini kuzatish uchun hisob yarating.</p>
      <form action={formAction} className="auth-form">
        <div className="flex flex-col gap-1">
          <label htmlFor="fullName" className="text-sm font-medium">
            Ism familiya
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            className="auth-input"
            placeholder="Ism va familiyangiz"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="auth-input"
            placeholder="name@example.com"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="password" className="text-sm font-medium">
            Parol
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            className="auth-input"
            placeholder="Kamida 6 ta belgi"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="auth-submit"
        >
          {pending ? "Yuborilmoqda..." : "Ro'yxatdan o'tish"}
        </button>
      </form>
      <p className="auth-switch">
        Hisobingiz bormi?{" "}
        <Link href="/login">
          Kirish
        </Link>
      </p>
    </div>
  );
}

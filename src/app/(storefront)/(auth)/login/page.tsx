"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="auth-shell">
      <div className="auth-kicker">FLEXSPORT ACCOUNT</div>
      <h1>Kirish</h1><p className="auth-intro">Buyurtmalar, sevimlilar va yetkazib berish manzillaringiz bir joyda.</p>
      <form action={formAction} className="auth-form">
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
            className="auth-input"
            placeholder="••••••••"
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
          {pending ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
      <p className="auth-switch">
        Hisobingiz yo&apos;qmi?{" "}
        <Link href="/register">
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </div>
  );
}

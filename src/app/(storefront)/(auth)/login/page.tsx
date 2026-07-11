"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login } from "@/actions/auth";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-16">
      <h1 className="text-2xl font-bold">Kirish</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="rounded border border-black/20 px-3 py-2 outline-none focus:border-[#8DC63F]"
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
            className="rounded border border-black/20 px-3 py-2 outline-none focus:border-[#8DC63F]"
          />
        </div>
        {state?.error && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 font-medium text-white transition hover:bg-[#8DC63F] disabled:opacity-60"
        >
          {pending ? "Kirilmoqda..." : "Kirish"}
        </button>
      </form>
      <p className="text-sm text-black/60">
        Hisobingiz yo&apos;qmi?{" "}
        <Link href="/register" className="font-medium text-black underline">
          Ro&apos;yxatdan o&apos;tish
        </Link>
      </p>
    </div>
  );
}

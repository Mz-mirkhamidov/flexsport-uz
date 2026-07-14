"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { mockCompletePayment } from "@/actions/checkout";

export function MockPayButton({ orderId }: { orderId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const result = await mockCompletePayment(orderId);
      if (!result.error) {
        router.push(`/checkout/success?order=${orderId}`);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="mt-4 w-full rounded bg-black px-5 py-3 text-sm font-medium text-white hover:bg-[#8DC63F] disabled:opacity-60"
    >
      {pending ? "Ishlanmoqda..." : "To'lovni yakunlash (test)"}
    </button>
  );
}

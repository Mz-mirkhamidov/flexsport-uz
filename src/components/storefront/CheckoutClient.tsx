"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Tables } from "@/types/database.types";
import { type CartItem, getCart, getCartTotal } from "@/lib/cart/store";
import { createOrder } from "@/actions/checkout";

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

type AddressWithZone = Tables<"addresses"> & {
  delivery_zones: Tables<"delivery_zones"> | null;
};

export function CheckoutClient({ addresses }: { addresses: AddressWithZone[] }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? "",
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setItems(getCart());
  }, []);

  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const productTotal = getCartTotal(items);
  const deliveryFee = selectedAddress?.delivery_zones?.fee ?? 0;

  function handleSubmit() {
    if (!selectedAddressId) {
      setError("Manzilni tanlang");
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createOrder(
        selectedAddressId,
        items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      window.localStorage.removeItem("flexsport_cart");
      window.dispatchEvent(new CustomEvent("flexsport:cart-updated"));
      if (result.checkoutUrl) {
        router.push(result.checkoutUrl);
      }
    });
  }

  if (items.length === 0) {
    return (
      <div className="text-center">
        <p className="text-black/60">Savatingiz bo&apos;sh.</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          Xarid qilishni boshlash
        </Link>
      </div>
    );
  }

  if (addresses.length === 0) {
    return (
      <div className="text-center">
        <p className="text-black/60">
          Buyurtma berish uchun avval manzil qo&apos;shing.
        </p>
        <Link
          href="/account/addresses"
          className="mt-4 inline-block rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-[#8DC63F]"
        >
          Manzil qo&apos;shish
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-[1fr_360px]">
      <div>
        <h2 className="mb-3 text-lg font-semibold">Manzil</h2>
        <div className="flex flex-col gap-2">
          {addresses.map((a) => (
            <label
              key={a.id}
              className={`flex cursor-pointer flex-col gap-1 rounded border p-3 text-sm ${
                selectedAddressId === a.id ? "border-[#8DC63F] bg-[#8DC63F]/5" : "border-black/10"
              }`}
            >
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  name="address"
                  checked={selectedAddressId === a.id}
                  onChange={() => setSelectedAddressId(a.id)}
                />
                <span className="font-medium">{a.full_name}</span>
              </div>
              <span className="pl-6 text-black/60">
                {a.phone} — {a.region}, {a.city}, {a.address_line}
              </span>
              <span className="pl-6 text-xs text-black/40">
                {a.delivery_zones?.name} —{" "}
                {a.delivery_zones ? formatPrice(a.delivery_zones.fee) : ""}
              </span>
            </label>
          ))}
        </div>

        <h2 className="mb-3 mt-8 text-lg font-semibold">Buyurtma tarkibi</h2>
        <div className="flex flex-col gap-2">
          {items.map((item) => (
            <div key={item.variantId} className="flex justify-between text-sm">
              <span>
                {item.name}
                {item.variantLabel && ` (${item.variantLabel})`} × {item.qty}
              </span>
              <span>{formatPrice(item.price * item.qty)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="h-fit rounded border border-black/10 p-4">
        <div className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <span>Mahsulotlar</span>
            <span>{formatPrice(productTotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Yetkazib berish</span>
            <span>{formatPrice(deliveryFee)}</span>
          </div>
          <div className="flex justify-between border-t border-black/10 pt-2 font-bold">
            <span>Jami</span>
            <span>{formatPrice(productTotal + deliveryFee)}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-black/50">
          Mahsulot narxi Payme orqali oldindan to&apos;lanadi. Yetkazib
          berish puli kuryer/pochta orqali naqd olinadi.
        </p>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={pending}
          className="mt-4 w-full rounded bg-black px-4 py-3 text-sm font-medium text-white hover:bg-[#8DC63F] disabled:opacity-60"
        >
          {pending ? "Yuborilmoqda..." : "Payme orqali to'lash"}
        </button>
      </div>
    </div>
  );
}

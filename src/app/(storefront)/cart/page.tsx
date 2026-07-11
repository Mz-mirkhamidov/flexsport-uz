"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  type CartItem,
  getCart,
  getCartTotal,
  removeFromCart,
  subscribeToCart,
  updateCartQty,
} from "@/lib/cart/store";

function formatPrice(value: number) {
  return new Intl.NumberFormat("uz-UZ").format(value) + " so'm";
}

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const update = () => setItems(getCart());
    update();
    return subscribeToCart(update);
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Savat</h1>
        <p className="mt-4 text-black/50">Savatingiz bo&apos;sh.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-black px-5 py-2 text-sm font-medium text-white hover:bg-[#8DC63F]"
        >
          Xarid qilishni boshlash
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold">Savat</h1>
      <div className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center gap-4 rounded border border-black/10 p-3"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded bg-black/5">
              {item.image && (
                <Image src={item.image} alt={item.name} fill className="object-cover" />
              )}
            </div>
            <div className="flex-1">
              <Link
                href={`/product/${item.productSlug}`}
                className="text-sm font-medium hover:underline"
              >
                {item.name}
              </Link>
              {item.variantLabel && (
                <p className="text-xs text-black/50">{item.variantLabel}</p>
              )}
              <p className="mt-1 text-sm font-semibold">
                {formatPrice(item.price)}
              </p>
            </div>
            <input
              type="number"
              min={1}
              max={item.maxStock}
              value={item.qty}
              onChange={(e) =>
                updateCartQty(item.variantId, Number(e.target.value))
              }
              className="w-16 rounded border border-black/20 px-2 py-1 text-sm"
            />
            <button
              onClick={() => removeFromCart(item.variantId)}
              className="text-sm text-red-600 hover:underline"
            >
              O&apos;chirish
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 flex items-center justify-between border-t border-black/10 pt-6">
        <span className="text-lg font-bold">
          Jami: {formatPrice(getCartTotal(items))}
        </span>
        <Link
          href="/checkout"
          className="rounded bg-black px-6 py-3 text-sm font-medium text-white hover:bg-[#8DC63F]"
        >
          Buyurtma berish
        </Link>
      </div>
    </div>
  );
}

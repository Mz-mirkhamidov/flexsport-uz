"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCart, getCartCount, subscribeToCart } from "@/lib/cart/store";

export function CartBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(getCartCount(getCart()));
    update();
    return subscribeToCart(update);
  }, []);

  return (
    <Link href="/cart" className="cart-link" aria-label={`Savat, ${count} ta mahsulot`}>
      <span aria-hidden="true">□</span> Savat
      {count > 0 && (
        <span className="ml-1 rounded-full bg-[#8DC63F] px-1.5 py-0.5 text-xs font-bold text-black">
          {count}
        </span>
      )}
    </Link>
  );
}

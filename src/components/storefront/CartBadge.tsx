"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "@phosphor-icons/react";
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
      <ShoppingCart aria-hidden="true" />
      <span className="cart-label">Savat</span>
      {count > 0 && (
        <span className="cart-count">
          {count}
        </span>
      )}
    </Link>
  );
}

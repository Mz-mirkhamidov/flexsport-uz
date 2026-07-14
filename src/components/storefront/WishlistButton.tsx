"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/actions/wishlist";

export function WishlistButton({
  productId,
  productSlug,
  initialWishlisted,
  isLoggedIn,
}: {
  productId: string;
  productSlug: string;
  initialWishlisted: boolean;
  isLoggedIn: boolean;
}) {
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    startTransition(async () => {
      const result = await toggleWishlist(productId, productSlug);
      if (typeof result.wishlisted === "boolean") {
        setWishlisted(result.wishlisted);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className={`flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium transition ${
        wishlisted
          ? "border-[#8DC63F] bg-[#8DC63F]/10 text-black"
          : "border-black/20 hover:border-[#8DC63F]"
      }`}
    >
      {wishlisted ? "♥ Sevimlida" : "♡ Sevimlilarga qo'shish"}
    </button>
  );
}

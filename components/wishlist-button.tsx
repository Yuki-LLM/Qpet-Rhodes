"use client";

import { useActionState, useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { addToWishlistInline, type WishlistState } from "@/lib/actions/shop";

const initialState: WishlistState = {
  status: "idle",
  message: ""
};

export function WishlistButton({
  productId,
  variantId,
  label,
  className = "flex size-10 items-center justify-center rounded-full border border-line bg-white text-qpet-dark shadow-sm transition hover:bg-qpet hover:text-white",
  iconSize = 18
}: {
  productId: string;
  variantId?: string;
  label?: string;
  className?: string;
  iconSize?: number;
}) {
  const [state, formAction, pending] = useActionState(addToWishlistInline, initialState);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (state.status === "success") setSaved(true);
  }, [state.status]);

  return (
    <form action={formAction}>
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="variant_id" value={variantId ?? ""} />
      <button
        className={`${className} ${saved ? "border-qpet bg-white text-qpet-dark hover:bg-white hover:text-qpet-dark" : ""}`}
        aria-label={saved ? "Added to Wishlist" : "Add to Wishlist"}
        disabled={!variantId || pending || saved}
      >
        <Heart size={iconSize} fill={saved ? "currentColor" : "none"} />
        {label ? <span>{saved ? "Added to Wishlist" : label}</span> : null}
      </button>
      {state.status === "error" ? <p className="mt-2 text-xs font-semibold text-clay">{state.message}</p> : null}
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { updateCartItem } from "@/lib/actions/shop";

type CartQuantityControlProps = {
  cartItemId: string;
  quantity: number;
};

function toQuantity(value: string | number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 1;
  return Math.max(1, Math.floor(parsed));
}

export function CartQuantityControl({ cartItemId, quantity }: CartQuantityControlProps) {
  const router = useRouter();
  const [value, setValue] = useState(String(quantity));
  const [isPending, startTransition] = useTransition();
  const lastSavedQuantity = useRef(quantity);

  function saveQuantity(nextValue: string | number) {
    const nextQuantity = toQuantity(nextValue);
    setValue(String(nextQuantity));

    if (nextQuantity === lastSavedQuantity.current) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("cart_item_id", cartItemId);
      formData.set("quantity", String(nextQuantity));

      await updateCartItem(formData);
      lastSavedQuantity.current = nextQuantity;
      router.refresh();
    });
  }

  return (
    <div className="flex items-center overflow-hidden rounded-full border border-line bg-white shadow-sm">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={isPending || toQuantity(value) <= 1}
        onClick={() => saveQuantity(toQuantity(value) - 1)}
        className="flex size-9 items-center justify-center text-lg font-semibold text-qpet-dark transition hover:bg-qpet-soft disabled:cursor-not-allowed disabled:text-slate-300"
      >
        -
      </button>
      <input
        aria-label="Quantity"
        inputMode="numeric"
        min="1"
        value={value}
        onChange={(event) => setValue(event.target.value.replace(/\D/g, ""))}
        onBlur={() => saveQuantity(value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.currentTarget.blur();
          }
        }}
        className="h-9 w-12 border-x border-line bg-white text-center text-sm font-bold text-qpet-dark outline-none"
      />
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={isPending}
        onClick={() => saveQuantity(toQuantity(value) + 1)}
        className="flex size-9 items-center justify-center text-lg font-semibold text-qpet-dark transition hover:bg-qpet-soft disabled:cursor-not-allowed disabled:text-slate-300"
      >
        +
      </button>
    </div>
  );
}

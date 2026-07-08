"use client";

import { useActionState } from "react";
import { ShoppingCart } from "lucide-react";
import { addToCartInline, type AddToCartState } from "@/lib/actions/shop";

const initialState: AddToCartState = {
  status: "idle",
  message: ""
};

export function AddToCartForm({
  productId,
  variantId,
  showQuantity = false,
  buttonClassName = "btn-primary w-full py-2.5"
}: {
  productId: string;
  variantId: string;
  showQuantity?: boolean;
  buttonClassName?: string;
}) {
  const [state, formAction, pending] = useActionState(addToCartInline, initialState);

  return (
    <form action={formAction} className="grid gap-2">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="variant_id" value={variantId} />
      <div className={showQuantity ? "flex items-center gap-2" : ""}>
        {showQuantity ? (
          <input className="field w-20" type="number" min="1" name="quantity" defaultValue="1" aria-label="Quantity" />
        ) : (
          <input type="hidden" name="quantity" value="1" />
        )}
        <button className={buttonClassName} disabled={pending}>
          <ShoppingCart size={17} />
          {pending ? "Adding..." : state.status === "success" ? "Added" : "Add to Cart"}
        </button>
      </div>
      {state.message ? (
        <p className={`text-sm font-semibold ${state.status === "success" ? "text-qpet-dark" : "text-clay"}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

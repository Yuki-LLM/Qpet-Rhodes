import { AddToCartForm } from "@/components/add-to-cart-form";
import { WishlistButton } from "@/components/wishlist-button";
import type { Product } from "@/lib/types";
import { formatMoney, getVariantPrice } from "@/lib/utils/format";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const variants = [...(product.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);

  if (!variants.length) {
    return (
      <div className="rounded-2xl border border-line bg-white p-5 text-sm text-slate-600">
        This product does not have a purchasable variant yet.
      </div>
    );
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 className="text-lg font-bold">Choose a size</h2>
      {variants.map((variant) => {
        const inStock = variant.stock_status === "In Stock";

        return (
          <div
            key={variant.id}
            className="grid gap-3 rounded-2xl border border-line bg-mist/60 p-4 sm:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="font-bold">{variant.variant_name}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
                {variant.sale_price ? (
                  <>
                    <span className="font-bold text-qpet-dark">{formatMoney(variant.sale_price)}</span>
                    <span className="text-slate-400 line-through">{formatMoney(variant.price)}</span>
                  </>
                ) : (
                  <span className="font-bold">{formatMoney(getVariantPrice(variant))}</span>
                )}
                <span className={inStock ? "text-qpet-dark" : "text-slate-500"}>{variant.stock_status}</span>
              </div>
            </div>
            {inStock ? (
              <AddToCartForm
                productId={product.id}
                variantId={variant.id}
                showQuantity
                buttonClassName="btn-primary whitespace-nowrap"
              />
            ) : (
              <WishlistButton
                productId={product.id}
                variantId={variant.id}
                label="Add to Wishlist"
                iconSize={17}
                className="btn-secondary whitespace-nowrap"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

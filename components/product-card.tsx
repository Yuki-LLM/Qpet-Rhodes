import Image from "next/image";
import Link from "next/link";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { WishlistButton } from "@/components/wishlist-button";
import type { Product, ProductVariant } from "@/lib/types";
import { firstVariant, formatMoney, getVariantPrice } from "@/lib/utils/format";

function getDisplayVariant(product: Product) {
  const variants = [...(product.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  return variants.find((variant) => variant.stock_status === "In Stock") ?? variants[0];
}

function priceLabel(variant?: ProductVariant) {
  if (!variant) return "Price unavailable";
  return formatMoney(getVariantPrice(variant));
}

export function ProductCard({ product, compact = false }: { product: Product; compact?: boolean }) {
  const variant = getDisplayVariant(product) as ProductVariant | undefined;
  const hasStock = product.product_variants?.some((item) => item.stock_status === "In Stock");
  const cheapestVariant = firstVariant(product) as ProductVariant | undefined;
  const hasSale = Boolean(cheapestVariant?.sale_price);

  return (
    <article className="group relative grid overflow-hidden rounded-xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft sm:rounded-2xl">
      <div className="absolute right-3 top-3 z-10 sm:right-4 sm:top-4">
        <WishlistButton productId={product.id} variantId={variant?.id} />
      </div>

      {hasSale ? (
        <span className="absolute left-3 top-3 z-10 rounded-lg bg-qpet px-2.5 py-1 text-[11px] font-bold text-white sm:left-4 sm:top-4 sm:px-3 sm:text-xs">Sale</span>
      ) : null}

      <Link href={`/products/${product.slug}`} className={`relative bg-mist ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain p-4 transition duration-300 group-hover:scale-105 sm:p-7"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
        )}
      </Link>

      <div className="grid gap-3 p-3 sm:gap-4 sm:p-5">
        <div className="grid gap-1.5 sm:gap-2">
          <p className="line-clamp-1 text-[11px] font-bold text-qpet-dark sm:text-xs">{product.brand}</p>
          <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-10 text-sm font-bold leading-snug text-ink hover:text-qpet-dark sm:min-h-11 sm:text-base">
            {product.name}
          </Link>
          <p className="line-clamp-1 text-xs text-slate-500 sm:text-sm">{cheapestVariant?.variant_name ?? "Default"}</p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
          <div>
            <p className="text-base font-bold text-ink sm:text-lg">{priceLabel(cheapestVariant)}</p>
            {cheapestVariant?.sale_price ? (
              <p className="text-xs text-slate-400 line-through sm:text-sm">{formatMoney(cheapestVariant.price)}</p>
            ) : null}
          </div>
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold sm:px-3 sm:text-xs ${hasStock ? "bg-qpet-soft text-qpet-dark" : "bg-slate-100 text-slate-500"}`}>
            {hasStock ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {variant ? (
          hasStock ? (
            <AddToCartForm productId={product.id} variantId={variant.id} />
          ) : (
            <WishlistButton
              productId={product.id}
              variantId={variant.id}
              label="Wishlist"
              iconSize={17}
              className="btn-secondary w-full py-2.5"
            />
          )
        ) : null}
      </div>
    </article>
  );
}

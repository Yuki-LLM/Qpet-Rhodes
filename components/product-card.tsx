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
    <article className="group relative grid overflow-hidden rounded-2xl border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="absolute right-4 top-4 z-10">
        <WishlistButton productId={product.id} variantId={variant?.id} />
      </div>

      {hasSale ? (
        <span className="absolute left-4 top-4 z-10 rounded-lg bg-qpet px-3 py-1 text-xs font-bold text-white">Sale</span>
      ) : null}

      <Link href={`/products/${product.slug}`} className={`relative bg-mist ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-contain p-7 transition duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
        )}
      </Link>

      <div className="grid gap-4 p-5">
        <div className="grid gap-2">
          <p className="text-xs font-bold text-qpet-dark">{product.brand}</p>
          <Link href={`/products/${product.slug}`} className="line-clamp-2 min-h-11 font-bold leading-snug text-ink hover:text-qpet-dark">
            {product.name}
          </Link>
          <p className="text-sm text-slate-500">{cheapestVariant?.variant_name ?? "Default"}</p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-lg font-bold text-ink">{priceLabel(cheapestVariant)}</p>
            {cheapestVariant?.sale_price ? (
              <p className="text-sm text-slate-400 line-through">{formatMoney(cheapestVariant.price)}</p>
            ) : null}
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-bold ${hasStock ? "bg-qpet-soft text-qpet-dark" : "bg-slate-100 text-slate-500"}`}>
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
              label="Add to Wishlist"
              iconSize={17}
              className="btn-secondary w-full py-2.5"
            />
          )
        ) : null}
      </div>
    </article>
  );
}

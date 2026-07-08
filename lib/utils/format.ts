export function formatMoney(value: number | null | undefined) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD"
  }).format(amount);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

export function getVariantPrice(variant?: { price: number; sale_price?: number | null }) {
  if (!variant) return 0;
  return variant.sale_price ?? variant.price;
}

export function firstVariant(product: { product_variants?: Array<{ sort_order: number }> }) {
  return [...(product.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order)[0];
}

import { sampleProducts } from "@/lib/data/sample-products";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export type ProductFilters = {
  q?: string;
  brand?: string;
  category?: string;
  petType?: string;
  stock?: string;
};

function sortProducts(products: Product[]) {
  return [...products].sort((a, b) => a.name.localeCompare(b.name));
}

function productMatches(product: Product, filters: ProductFilters) {
  const q = filters.q?.trim().toLowerCase();
  const stock = filters.stock?.trim();

  if (q) {
    const text = `${product.name} ${product.brand} ${product.category} ${product.description ?? ""}`.toLowerCase();
    if (!text.includes(q)) return false;
  }

  if (filters.brand && product.brand !== filters.brand) return false;
  if (filters.category && product.category !== filters.category) return false;
  if (filters.petType && !product.pet_type?.includes(filters.petType)) return false;

  if (stock) {
    const hasStock = product.product_variants?.some((variant) => variant.stock_status === stock);
    if (!hasStock) return false;
  }

  return true;
}

export async function getProducts(filters: ProductFilters = {}) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return sortProducts(sampleProducts.filter((product) => productMatches(product, filters)));
  }

  let query = supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .order("sort_order", { referencedTable: "product_variants", ascending: true });

  if (filters.q) query = query.ilike("name", `%${filters.q}%`);
  if (filters.brand) query = query.eq("brand", filters.brand);
  if (filters.category) query = query.eq("category", filters.category);
  if (filters.petType) query = query.ilike("pet_type", `%${filters.petType}%`);

  const { data, error } = await query;
  if (error || !data) return [];

  const products = data as Product[];
  return products.filter((product) => productMatches(product, { stock: filters.stock }));
}

export async function getBrandSummaries() {
  const products = await getProducts();
  const brands = new Map<string, { brand: string; count: number; imageUrl: string | null }>();

  products.forEach((product) => {
    const current = brands.get(product.brand);
    if (current) {
      current.count += 1;
      current.imageUrl = current.imageUrl ?? product.image_url ?? null;
    } else {
      brands.set(product.brand, {
        brand: product.brand,
        count: 1,
        imageUrl: product.image_url ?? null
      });
    }
  });

  return [...brands.values()].sort((a, b) => a.brand.localeCompare(b.brand));
}

export async function getProductBySlug(slug: string) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return sampleProducts.find((product) => product.slug === slug) ?? null;
  }

  const { data } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "product_variants", ascending: true })
    .single();

  return (data as Product | null) ?? null;
}

export async function getFilterOptions() {
  const products = await getProducts();

  return {
    brands: [...new Set(products.map((product) => product.brand).filter(Boolean))].sort(),
    categories: [...new Set(products.map((product) => product.category).filter(Boolean))].sort(),
    petTypes: [
      ...new Set(products.map((product) => product.pet_type).filter((petType): petType is string => Boolean(petType)))
    ].sort()
  };
}

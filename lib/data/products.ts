import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types";

export type ProductFilters = {
  q?: string;
  brand?: string;
  category?: string;
  petType?: string;
  stock?: string;
};

type ProductQueryOptions = {
  limit?: number;
};

type ProductPageOptions = {
  page?: number;
  pageSize?: number;
};

const PRODUCT_SELECT = "*, product_variants(*)";

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

function applyProductFilters<T>(query: T, filters: ProductFilters) {
  let nextQuery = query as any;

  if (filters.q) nextQuery = nextQuery.ilike("name", `%${filters.q}%`);
  if (filters.brand) nextQuery = nextQuery.eq("brand", filters.brand);
  if (filters.category) nextQuery = nextQuery.eq("category", filters.category);
  if (filters.petType) nextQuery = nextQuery.ilike("pet_type", `%${filters.petType}%`);

  return nextQuery as T;
}

export async function getProducts(filters: ProductFilters = {}, options: ProductQueryOptions = {}) {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    return [];
  }

  let query = applyProductFilters(
    supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("name", { ascending: true })
      .order("sort_order", { referencedTable: "product_variants", ascending: true }),
    filters
  );

  if (options.limit && !filters.stock) query = query.limit(options.limit);

  const { data, error } = await query;
  if (error || !data) return [];

  const products = data as Product[];
  const filteredProducts = products.filter((product) => productMatches(product, { stock: filters.stock }));
  return options.limit ? filteredProducts.slice(0, options.limit) : filteredProducts;
}

export async function getProductPage(filters: ProductFilters = {}, options: ProductPageOptions = {}) {
  const page = Math.max(1, Number(options.page) || 1);
  const pageSize = Math.max(1, Number(options.pageSize) || 48);
  const supabase = await createSupabaseServerClient();

  if (!supabase || filters.stock) {
    const products = await getProducts(filters);
    const total = products.length;
    const start = (page - 1) * pageSize;

    return {
      products: products.slice(start, start + pageSize),
      total,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(total / pageSize))
    };
  }

  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const query = applyProductFilters(
    supabase
      .from("products")
      .select(PRODUCT_SELECT, { count: "exact" })
      .eq("is_active", true)
      .order("name", { ascending: true })
      .order("sort_order", { referencedTable: "product_variants", ascending: true })
      .range(start, end),
    filters
  );

  const { data, error, count } = await query;
  const products = error || !data ? [] : (data as Product[]);
  const total = count ?? products.length;

  return {
    products,
    total,
    page,
    pageSize,
    pageCount: Math.max(1, Math.ceil(total / pageSize))
  };
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
    return null;
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

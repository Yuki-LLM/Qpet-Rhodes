import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import type { Order, Product } from "@/lib/types";

export async function getAdminProducts() {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();
  if (!supabase || !admin) return [] as Product[];

  const { data } = await supabase
    .from("products")
    .select("*, product_variants(*)")
    .eq("is_active", true)
    .order("name", { ascending: true })
    .order("sort_order", { referencedTable: "product_variants", ascending: true });

  return (data ?? []) as Product[];
}

export async function getAdminOrders() {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();
  if (!supabase || !admin) return [] as Order[];

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  return (data ?? []) as Order[];
}

export async function getWishlistStats() {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();
  if (!supabase || !admin) return [];

  const { data } = await supabase
    .from("wishlist_product_counts")
    .select("*")
    .order("wishlist_count", { ascending: false });

  return data ?? [];
}

export async function getAdminDashboardStats() {
  const products = await getAdminProducts();
  const orders = await getAdminOrders();
  const wishlistStats = await getWishlistStats();

  return {
    products: products.length,
    newOrders: orders.filter((order) => order.status === "New Order").length,
    readyOrders: orders.filter((order) => order.status === "Ready for Pickup").length,
    wishlistProducts: wishlistStats.length
  };
}

import { createSupabaseServerClient, getCurrentUser } from "@/lib/supabase/server";
import type { CartLine, Order } from "@/lib/types";

export async function getCartItems() {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return [] as CartLine[];

  const { data } = await supabase
    .from("cart_items")
    .select("id, quantity, products(*), product_variants(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as unknown as CartLine[];
}

export async function getWishlistItems() {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return [];

  const { data } = await supabase
    .from("wishlists")
    .select("id, products(*), product_variants(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getCustomerOrders() {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return [] as Order[];

  const { data } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as Order[];
}

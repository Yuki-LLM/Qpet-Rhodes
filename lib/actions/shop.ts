"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import type { OrderStatus } from "@/lib/types";

export type AddToCartState = {
  status: "idle" | "success" | "error";
  message: string;
};

export type WishlistState = {
  status: "idle" | "success" | "error";
  message: string;
};

function isValidPickupTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return false;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return false;
  if (minute < 0 || minute > 59) return false;

  return (hour > 9 || (hour === 9 && minute >= 0)) && (hour < 17 || (hour === 17 && minute === 0));
}

async function getUserOrRedirect(nextPath: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(`/login?message=${encodeURIComponent("Connect Supabase before using accounts.")}`);

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  return { supabase, user };
}

async function upsertCartItem({
  supabase,
  userId,
  productId,
  variantId,
  quantity
}: {
  supabase: NonNullable<Awaited<ReturnType<typeof createSupabaseServerClient>>>;
  userId: string;
  productId: string;
  variantId: string;
  quantity: number;
}) {
  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", userId)
    .eq("variant_id", variantId)
    .maybeSingle();

  if (existing) {
    return supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  }

  return supabase.from("cart_items").insert({
    user_id: userId,
    product_id: productId,
    variant_id: variantId,
    quantity
  });
}

export async function addToCart(formData: FormData) {
  const { supabase, user } = await getUserOrRedirect("/cart");
  const productId = String(formData.get("product_id"));
  const variantId = String(formData.get("variant_id"));
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));

  await upsertCartItem({ supabase, userId: user.id, productId, variantId, quantity });

  revalidatePath("/cart");
  redirect("/cart");
}

export async function addToCartInline(
  _previousState: AddToCartState,
  formData: FormData
): Promise<AddToCartState> {
  const { supabase, user } = await getUserOrRedirect("/products");
  const productId = String(formData.get("product_id"));
  const variantId = String(formData.get("variant_id"));
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));

  const { error } = await upsertCartItem({ supabase, userId: user.id, productId, variantId, quantity });

  if (error) {
    return { status: "error" as const, message: "Could not add item. Please try again." };
  }

  revalidatePath("/cart");
  return { status: "success" as const, message: "Added to cart." };
}

export async function updateCartItem(formData: FormData) {
  const { supabase, user } = await getUserOrRedirect("/cart");
  const cartItemId = String(formData.get("cart_item_id"));
  const quantity = Math.max(1, Number(formData.get("quantity") ?? 1));

  await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", cartItemId)
    .eq("user_id", user.id);

  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  const { supabase, user } = await getUserOrRedirect("/cart");
  const cartItemId = String(formData.get("cart_item_id"));

  await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", user.id);
  revalidatePath("/cart");
}

export async function addToWishlist(formData: FormData) {
  const { supabase, user } = await getUserOrRedirect("/wishlist");
  const productId = String(formData.get("product_id"));
  const variantId = String(formData.get("variant_id"));

  await supabase.from("wishlists").upsert(
    {
      user_id: user.id,
      product_id: productId,
      variant_id: variantId
    },
    { onConflict: "user_id,variant_id" }
  );

  revalidatePath("/wishlist");
  redirect("/wishlist");
}

export async function addToWishlistInline(
  _previousState: WishlistState,
  formData: FormData
): Promise<WishlistState> {
  const { supabase, user } = await getUserOrRedirect("/wishlist");
  const productId = String(formData.get("product_id"));
  const variantId = String(formData.get("variant_id"));

  if (!productId || !variantId) {
    return { status: "error", message: "Could not add item. Please try again." };
  }

  const { error } = await supabase.from("wishlists").upsert(
    {
      user_id: user.id,
      product_id: productId,
      variant_id: variantId
    },
    { onConflict: "user_id,variant_id" }
  );

  if (error) {
    return { status: "error", message: "Could not add item. Please try again." };
  }

  revalidatePath("/wishlist");
  return { status: "success", message: "Added to wishlist." };
}

export async function removeFromWishlist(formData: FormData) {
  const { supabase, user } = await getUserOrRedirect("/wishlist");
  const wishlistId = String(formData.get("wishlist_id"));

  await supabase.from("wishlists").delete().eq("id", wishlistId).eq("user_id", user.id);
  revalidatePath("/wishlist");
}

export async function cancelCustomerOrder(formData: FormData) {
  const { supabase, user } = await getUserOrRedirect("/orders");
  const orderId = String(formData.get("order_id"));

  const { data: order } = await supabase
    .from("orders")
    .select("id, status")
    .eq("id", orderId)
    .eq("user_id", user.id)
    .single();

  if (!order || ["Ready for Pickup", "Completed", "Cancelled"].includes(order.status)) {
    redirect("/orders?message=This order can no longer be cancelled.");
  }

  const { error } = await supabase
    .from("orders")
    .update({ status: "Cancelled" })
    .eq("id", orderId)
    .eq("user_id", user.id);

  if (error) {
    redirect("/orders?message=Order could not be cancelled. Please contact the store.");
  }

  revalidatePath("/orders");
  revalidatePath("/account");
  revalidatePath("/admin/orders");
  redirect("/orders?message=Your order has been cancelled.");
}

export async function createPickupOrder(formData: FormData) {
  const { supabase, user } = await getUserOrRedirect("/checkout");
  const pickupDate = String(formData.get("pickup_date") ?? "");
  const pickupTime = String(formData.get("pickup_time") ?? "");

  const selectedDate = new Date(`${pickupDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!pickupDate || Number.isNaN(selectedDate.getTime()) || selectedDate < today || selectedDate.getDay() === 1) {
    redirect("/checkout?message=Please choose a pickup date from Tuesday to Sunday.");
  }

  if (!isValidPickupTime(pickupTime)) {
    redirect("/checkout?message=Please choose a pickup time between 9:00 and 17:00.");
  }

  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("id, quantity, products(*), product_variants(*)")
    .eq("user_id", user.id);

  if (!cartItems?.length) redirect("/cart?message=Your cart is empty.");

  const totalAmount = cartItems.reduce((sum, item: any) => {
    const price = item.product_variants.sale_price ?? item.product_variants.price;
    return sum + price * item.quantity;
  }, 0);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "New Order",
      full_name: String(formData.get("full_name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      email: String(formData.get("email") ?? ""),
      pickup_date: pickupDate,
      pickup_time: pickupTime,
      notes: String(formData.get("notes") ?? ""),
      total_amount: totalAmount
    })
    .select("id")
    .single();

  if (error || !order) redirect("/checkout?message=Order could not be created.");

  await supabase.from("order_items").insert(
    cartItems.map((item: any) => ({
      order_id: order.id,
      product_id: item.products.id,
      variant_id: item.product_variants.id,
      product_name: item.products.name,
      variant_name: item.product_variants.variant_name,
      price: item.product_variants.sale_price ?? item.product_variants.price,
      quantity: item.quantity
    }))
  );

  await supabase.from("cart_items").delete().eq("user_id", user.id);

  revalidatePath("/orders");
  redirect("/orders");
}

export async function updateOrderStatus(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();
  if (!supabase || !admin) redirect("/login?message=Admin access is required.");

  const status = String(formData.get("status")) as OrderStatus;
  const orderId = String(formData.get("order_id"));

  await supabase.from("orders").update({ status }).eq("id", orderId);
  revalidatePath("/admin/orders");
}

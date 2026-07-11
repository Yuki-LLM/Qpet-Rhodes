"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient, requireAdmin } from "@/lib/supabase/server";
import { slugify } from "@/lib/utils/format";

async function getAdminClient() {
  const supabase = await createSupabaseServerClient();
  const admin = await requireAdmin();

  if (!supabase || !admin) redirect("/login?message=Admin access is required.");
  return supabase;
}

async function uploadImageIfPresent(formData: FormData, existingImageUrl?: string) {
  const supabase = await createSupabaseServerClient();
  const file = formData.get("image") as File | null;

  if (!supabase || !file || file.size === 0) return existingImageUrl ?? null;

  const extension = file.name.split(".").pop() || "jpg";
  const path = `admin/${Date.now()}-${slugify(file.name)}.${extension}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false
  });

  if (error) return existingImageUrl ?? null;

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

function redirectBack(formData: FormData, message: string) {
  const rawReturnTo = String(formData.get("return_to") ?? "/admin/products");
  const returnTo = rawReturnTo.startsWith("/admin/products") ? rawReturnTo : "/admin/products";
  const separator = returnTo.includes("?") ? "&" : "?";

  redirect(`${returnTo}${separator}message=${encodeURIComponent(message)}`);
}

export async function createProduct(formData: FormData) {
  const supabase = await getAdminClient();
  const name = String(formData.get("name") ?? "");
  const slug = slugify(name);
  const imageUrl = await uploadImageIfPresent(formData);

  const { data: product } = await supabase
    .from("products")
    .insert({
      name,
      slug,
      brand: String(formData.get("brand") ?? ""),
      category: String(formData.get("category") ?? ""),
      pet_type: String(formData.get("pet_type") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      image_url: imageUrl,
      source_url: String(formData.get("source_url") ?? "") || null,
      is_active: true
    })
    .select("id")
    .single();

  if (product) {
    await supabase.from("product_variants").insert({
      product_id: product.id,
      variant_name: String(formData.get("variant_name") ?? "Default"),
      price: Number(formData.get("price") ?? 0),
      sale_price: Number(formData.get("sale_price")) || null,
      stock_status: String(formData.get("stock_status") ?? "In Stock"),
      sort_order: 0
    });
  }

  revalidatePath("/admin/products");
  redirectBack(formData, "Product added.");
}

export async function updateProduct(formData: FormData) {
  const supabase = await getAdminClient();
  const id = String(formData.get("product_id"));
  const existingImageUrl = String(formData.get("existing_image_url") ?? "");
  const name = String(formData.get("name") ?? "");
  const imageUrl = await uploadImageIfPresent(formData, existingImageUrl);

  await supabase
    .from("products")
    .update({
      name,
      slug: slugify(name),
      brand: String(formData.get("brand") ?? ""),
      category: String(formData.get("category") ?? ""),
      pet_type: String(formData.get("pet_type") ?? "") || null,
      description: String(formData.get("description") ?? "") || null,
      image_url: imageUrl,
      source_url: String(formData.get("source_url") ?? "") || null
    })
    .eq("id", id);

  revalidatePath("/admin/products");
  redirectBack(formData, "Product saved.");
}

export async function deleteProduct(formData: FormData) {
  const supabase = await getAdminClient();
  const id = String(formData.get("product_id"));

  await supabase.from("products").update({ is_active: false }).eq("id", id);
  revalidatePath("/admin/products");
  redirectBack(formData, "Product hidden.");
}

export async function updateProductVariant(formData: FormData) {
  const supabase = await getAdminClient();
  const id = String(formData.get("variant_id"));
  const intent = String(formData.get("intent") ?? "save");

  if (intent === "delete") {
    await supabase.from("product_variants").delete().eq("id", id);
    revalidatePath("/admin/products");
    redirectBack(formData, "Variant deleted.");
  }

  await supabase
    .from("product_variants")
    .update({
      variant_name: String(formData.get("variant_name") ?? ""),
      price: Number(formData.get("price") ?? 0),
      sale_price: Number(formData.get("sale_price")) || null,
      stock_status: String(formData.get("stock_status") ?? "In Stock"),
      sort_order: Number(formData.get("sort_order") ?? 0)
    })
    .eq("id", id);

  revalidatePath("/admin/products");
  redirectBack(formData, "Variant saved.");
}

export async function addProductVariant(formData: FormData) {
  const supabase = await getAdminClient();
  const productId = String(formData.get("product_id"));

  await supabase.from("product_variants").insert({
    product_id: productId,
    variant_name: String(formData.get("variant_name") ?? "New variant"),
    price: Number(formData.get("price") ?? 0),
    sale_price: Number(formData.get("sale_price")) || null,
    stock_status: String(formData.get("stock_status") ?? "In Stock"),
    sort_order: Number(formData.get("sort_order") ?? 0)
  });

  revalidatePath("/admin/products");
  redirectBack(formData, "Variant added.");
}

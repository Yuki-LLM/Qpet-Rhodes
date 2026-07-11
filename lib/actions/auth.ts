"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function encodedMessage(path: string, message: string) {
  return `${path}?message=${encodeURIComponent(message)}`;
}

export async function signUp(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(encodedMessage("/signup", "Supabase is not connected yet."));

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("full_name") ?? "");
  const phone = String(formData.get("phone") ?? "");

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        phone
      }
    }
  });

  if (error) redirect(encodedMessage("/signup", error.message));

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/products");
  }

  redirect(
    encodedMessage(
      "/login",
      "Account created. Please confirm your email first, or turn off email confirmations in Supabase Auth settings."
    )
  );
}

export async function signIn(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect(encodedMessage("/login", "Supabase is not connected yet."));

  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) redirect(encodedMessage("/login", error.message));
  revalidatePath("/", "layout");
  redirect("/products");
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  revalidatePath("/", "layout");
  redirect("/");
}

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return { status: "error" as const, message: "Supabase is not connected yet." };

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) return { status: "error" as const, message: "Please sign in first." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      full_name: fullName,
      phone
    }
  });

  if (authError) {
    return {
      status: "error" as const,
      message: `Could not save profile: ${authError.message}`
    };
  }

  const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("id", user.id);

  if (error) return { status: "error" as const, message: `Could not save profile: ${error.message}` };

  revalidatePath("/account");
  revalidatePath("/checkout");
  return { status: "success" as const, message: "Profile saved." };
}

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

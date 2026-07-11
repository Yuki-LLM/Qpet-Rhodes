import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { isSupabaseConfigured } from "@/lib/config";

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) return null;

  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: any }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components cannot set cookies. Server Actions and Route Handlers can.
          }
        }
      }
    }
  );
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const {
    data: { user }
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentProfile() {
  const supabase = await createSupabaseServerClient();
  const user = await getCurrentUser();
  if (!supabase || !user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  if (data) {
    return {
      ...data,
      full_name: data.full_name ?? user.user_metadata?.full_name ?? null,
      phone: data.phone ?? user.user_metadata?.phone ?? null
    };
  }

  return {
    id: user.id,
    full_name: user.user_metadata?.full_name ?? null,
    phone: user.user_metadata?.phone ?? null,
    role: "customer",
    created_at: null
  };
}

export async function requireAdmin() {
  const profile = await getCurrentProfile();
  return profile?.role === "admin" ? profile : null;
}

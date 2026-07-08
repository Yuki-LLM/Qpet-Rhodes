import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/config";
import { requireAdmin } from "@/lib/supabase/server";

export async function AdminGuard({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured()) {
    return (
      <main className="container-shell py-10">
        <section className="rounded-md border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Supabase setup required</h1>
          <p className="mt-2 text-stone-600">
            Connect Supabase and set your profile role to admin before using the admin area.
          </p>
        </section>
      </main>
    );
  }

  const admin = await requireAdmin();

  if (!admin) {
    return (
      <main className="container-shell py-10">
        <section className="rounded-md border border-stone-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-bold">Admin access required</h1>
          <p className="mt-2 text-stone-600">Please sign in with an admin account.</p>
          <Link className="btn-primary mt-5" href="/login">
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}

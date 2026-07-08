import Link from "next/link";
import { signIn } from "@/lib/actions/auth";

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;

  return (
    <main className="container-shell grid min-h-[70vh] place-items-center py-10">
      <section className="w-full max-w-md rounded-md border border-stone-200 bg-white p-6 shadow-soft">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-stone-600">Access your cart, wishlist, and pickup orders.</p>
        {params.message ? <p className="mt-4 rounded-md bg-clay/10 p-3 text-sm text-clay">{params.message}</p> : null}
        <form action={signIn} className="mt-6 grid gap-4">
          <label className="grid gap-2">
            <span className="label">Email</span>
            <input className="field" type="email" name="email" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Password</span>
            <input className="field" type="password" name="password" required minLength={6} />
          </label>
          <button className="btn-primary">Sign in</button>
        </form>
        <p className="mt-5 text-sm text-stone-600">
          New here?{" "}
          <Link className="font-semibold text-sea" href="/signup">
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}

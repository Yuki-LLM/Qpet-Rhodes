import Link from "next/link";
import { PickupDateTimeFields } from "@/components/pickup-date-time-fields";
import { createPickupOrder } from "@/lib/actions/shop";
import { getCartItems } from "@/lib/data/account";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";
import { formatMoney, getVariantPrice } from "@/lib/utils/format";

export default async function CheckoutPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const [items, user, profile] = await Promise.all([getCartItems(), getCurrentUser(), getCurrentProfile()]);
  const total = items.reduce((sum, item) => sum + getVariantPrice(item.product_variants) * item.quantity, 0);

  if (!user) {
    return (
      <main className="container-shell py-10">
        <section className="rounded-md border border-stone-200 bg-white p-8">
          <h1 className="text-2xl font-bold">Checkout</h1>
          <p className="mt-2 text-stone-600">Please sign in before submitting a pickup reservation.</p>
          <Link className="btn-primary mt-5" href="/login">
            Sign in
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="container-shell grid gap-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Pickup checkout</h1>
        <p className="mt-2 text-stone-600">No online payment is required. Pay in store at pickup.</p>
        {params.message ? <p className="mt-4 rounded-2xl bg-clay/10 p-3 text-sm font-semibold text-clay">{params.message}</p> : null}
      </div>
      <section className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <form action={createPickupOrder} className="grid gap-4 rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <label className="grid gap-2">
            <span className="label">Full name</span>
            <input className="field" name="full_name" defaultValue={profile?.full_name ?? ""} required />
          </label>
          <label className="grid gap-2">
            <span className="label">Phone number</span>
            <input className="field" name="phone" defaultValue={profile?.phone ?? ""} required />
          </label>
          <label className="grid gap-2">
            <span className="label">Email</span>
            <input className="field" type="email" name="email" defaultValue={user.email ?? ""} required />
          </label>
          <PickupDateTimeFields />
          <label className="grid gap-2">
            <span className="label">Notes</span>
            <textarea className="field min-h-28" name="notes" placeholder="Anything we should know?" />
          </label>
          <button className="btn-primary">Submit pickup reservation</button>
        </form>
        <aside className="h-fit rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Order items</h2>
          <div className="mt-4 grid gap-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between gap-3 text-sm">
                <span>
                  {item.products.name} ({item.product_variants.variant_name}) x {item.quantity}
                </span>
                <span className="font-semibold">{formatMoney(getVariantPrice(item.product_variants) * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 font-bold">
            <span>Total</span>
            <span>{formatMoney(total)}</span>
          </div>
        </aside>
      </section>
    </main>
  );
}

import Link from "next/link";
import { ProfileForm } from "@/components/profile-form";
import { cancelCustomerOrder } from "@/lib/actions/shop";
import { getCustomerOrders } from "@/lib/data/account";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils/format";

export default async function AccountPage() {
  const [user, profile, orders] = await Promise.all([getCurrentUser(), getCurrentProfile(), getCustomerOrders()]);

  if (!user) {
    return (
      <main className="container-shell py-10">
        <div className="rounded-md border border-stone-200 bg-white p-8">
          <h1 className="text-2xl font-bold">Account</h1>
          <p className="mt-2 text-stone-600">Please sign in to view your account.</p>
          <Link className="btn-primary mt-5" href="/login">
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-shell grid gap-8 py-10">
      <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Account</h1>
        <p className="mt-2 text-sm text-slate-600">Update your contact details for pickup reservations.</p>
        <ProfileForm email={user.email} role={profile?.role} fullName={profile?.full_name} phone={profile?.phone} />
      </section>

      <section className="rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold">Order History</h2>
            <p className="mt-2 text-sm text-slate-600">Your pickup reservations and order status appear here.</p>
          </div>
          <Link href="/orders" className="btn-secondary py-2.5">
            View all orders
          </Link>
        </div>

        {orders.length ? (
          <div className="mt-6 grid gap-4">
            {orders.slice(0, 5).map((order) => (
              <article key={order.id} className="rounded-2xl bg-mist p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Order #{order.id.slice(0, 8)}</h3>
                    <p className="mt-1 text-sm text-slate-600">
                      Pickup: {order.pickup_date} at {order.pickup_time}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-qpet-soft px-3 py-1 text-sm font-bold text-qpet-dark">
                      {order.status}
                    </span>
                    {!["Ready for Pickup", "Completed", "Cancelled"].includes(order.status) ? (
                      <form action={cancelCustomerOrder}>
                        <input type="hidden" name="order_id" value={order.id} />
                        <button className="btn-secondary py-2 text-xs">Cancel order</button>
                      </form>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 grid gap-1 text-sm text-slate-700">
                  {order.order_items?.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between gap-3">
                      <span>
                        {item.product_name} ({item.variant_name}) x {item.quantity}
                      </span>
                      <span>{formatMoney(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 flex justify-between border-t border-line pt-3 font-bold">
                  <span>Total</span>
                  <span>{formatMoney(order.total_amount)}</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-line p-6 text-center">
            <p className="font-bold">No orders yet</p>
            <p className="mt-1 text-sm text-slate-600">After checkout, your pickup reservation will show here.</p>
            <Link href="/products" className="btn-primary mt-4">
              Shop products
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}

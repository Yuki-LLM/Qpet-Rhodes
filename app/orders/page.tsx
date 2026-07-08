import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { cancelCustomerOrder } from "@/lib/actions/shop";
import { getCustomerOrders } from "@/lib/data/account";
import { getCurrentUser } from "@/lib/supabase/server";
import { formatMoney } from "@/lib/utils/format";

export default async function OrdersPage({
  searchParams
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const params = await searchParams;
  const [user, orders] = await Promise.all([getCurrentUser(), getCustomerOrders()]);

  if (!user) {
    return (
      <main className="container-shell py-10">
        <EmptyState title="Sign in required" body="Please sign in to view your previous orders." actionHref="/login" actionLabel="Sign in" />
      </main>
    );
  }

  return (
    <main className="container-shell grid gap-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Orders</h1>
        <p className="mt-2 text-stone-600">Track your pickup reservations.</p>
        {params.message ? (
          <p className="mt-4 rounded-2xl bg-qpet-soft p-3 text-sm font-semibold text-qpet-dark">{params.message}</p>
        ) : null}
      </div>
      {!orders.length ? (
        <EmptyState title="No orders yet" body="Your pickup reservations will appear here." actionHref="/products" actionLabel="Shop products" />
      ) : (
        <div className="grid gap-4">
          {orders.map((order) => (
            <article key={order.id} className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-semibold">Order #{order.id.slice(0, 8)}</h2>
                  <p className="mt-1 text-sm text-stone-600">
                    Pickup: {order.pickup_date} at {order.pickup_time}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-sea/10 px-3 py-1 text-sm font-semibold text-sea">{order.status}</span>
                  {!["Ready for Pickup", "Completed", "Cancelled"].includes(order.status) ? (
                    <form action={cancelCustomerOrder}>
                      <input type="hidden" name="order_id" value={order.id} />
                      <button className="btn-secondary py-2 text-xs">Cancel order</button>
                    </form>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid gap-2 text-sm text-stone-700">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex justify-between gap-3">
                    <span>
                      {item.product_name} ({item.variant_name}) x {item.quantity}
                    </span>
                    <span>{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-between border-t border-stone-200 pt-4 font-bold">
                <span>Total</span>
                <span>{formatMoney(order.total_amount)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

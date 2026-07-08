import { updateOrderStatus } from "@/lib/actions/shop";
import { getAdminOrders } from "@/lib/data/admin";
import { formatMoney } from "@/lib/utils/format";
import type { OrderStatus } from "@/lib/types";

const statuses: OrderStatus[] = ["New Order", "Preparing", "Ready for Pickup", "Completed", "Cancelled"];

function statusClass(status: OrderStatus) {
  if (status === "Cancelled") return "bg-clay/10 text-clay";
  if (status === "Ready for Pickup") return "bg-qpet-soft text-qpet-dark";
  if (status === "Completed") return "bg-slate-100 text-slate-600";
  return "bg-sea/10 text-sea";
}

export default async function AdminOrdersPage() {
  const orders = await getAdminOrders();

  return (
    <section className="grid gap-4">
      {orders.map((order) => (
        <article key={order.id} className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold">Order #{order.id.slice(0, 8)}</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-stone-600">
                {order.full_name} / {order.phone} / {order.email}
              </p>
              <p className="mt-1 text-sm text-stone-600">
                Pickup: {order.pickup_date} at {order.pickup_time}
              </p>
              {order.notes ? <p className="mt-2 text-sm text-stone-700">Notes: {order.notes}</p> : null}
            </div>
            <form action={updateOrderStatus} className="flex items-center gap-2">
              <input type="hidden" name="order_id" value={order.id} />
              <select className="field" name="status" defaultValue={order.status}>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <button className="btn-primary">Update</button>
            </form>
          </div>
          <div className="mt-4 grid gap-2 border-t border-stone-200 pt-4 text-sm">
            {order.order_items?.map((item) => (
              <div key={item.id} className="flex justify-between gap-3">
                <span>
                  {item.product_name} ({item.variant_name}) x {item.quantity}
                </span>
                <span>{formatMoney(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex justify-between font-bold">
            <span>Total</span>
            <span>{formatMoney(order.total_amount)}</span>
          </div>
        </article>
      ))}
      {!orders.length ? (
        <div className="rounded-md border border-stone-200 bg-white p-8 text-center text-stone-600">No orders yet.</div>
      ) : null}
    </section>
  );
}

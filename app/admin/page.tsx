import { getAdminDashboardStats } from "@/lib/data/admin";

export default async function AdminDashboardPage() {
  const stats = await getAdminDashboardStats();

  const cards = [
    { label: "Active products", value: stats.products },
    { label: "New orders", value: stats.newOrders },
    { label: "Ready for pickup", value: stats.readyOrders },
    { label: "Wishlist products", value: stats.wishlistProducts }
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <div key={card.label} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-slate-500">{card.label}</p>
          <p className="mt-3 text-3xl font-bold text-ink">{card.value}</p>
        </div>
      ))}
    </section>
  );
}

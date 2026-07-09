import { AdminGuard } from "@/components/admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <main className="bg-mist/40 pb-24 sm:pb-10">
        <div className="container-shell grid gap-6 py-8">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-qpet-dark">Admin workspace</p>
            <h1 className="mt-2 text-2xl font-bold text-ink sm:text-3xl">Store management</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Manage inventory, pickup reservations, and wishlist demand for Qpet Rhodes.
            </p>
          </section>
          {children}
        </div>
      </main>
    </AdminGuard>
  );
}

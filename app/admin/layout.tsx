import { AdminGuard } from "@/components/admin-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <main className="container-shell grid gap-8 py-8">
        <div>
          <h1 className="text-3xl font-bold">Admin</h1>
          <p className="mt-2 text-stone-600">Manage products, pickup orders, and restock demand.</p>
        </div>
        {children}
      </main>
    </AdminGuard>
  );
}

import Link from "next/link";
import { getWishlistStats } from "@/lib/data/admin";

export default async function AdminWishlistPage() {
  const rows = await getWishlistStats();

  return (
    <section className="overflow-hidden rounded-md border border-stone-200 bg-white shadow-sm">
      <div className="border-b border-stone-200 p-5">
        <h2 className="text-xl font-semibold">Wishlist demand</h2>
        <p className="mt-1 text-sm text-stone-600">Products with the most wishlist saves should be reviewed for restock.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-stone-50 text-xs uppercase text-stone-500">
            <tr>
              <th className="px-4 py-3">Product</th>
              <th className="px-4 py-3">Variant</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Wishlist count</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: any) => (
              <tr key={`${row.product_id}-${row.variant_id}`} className="border-t border-stone-100">
                <td className="px-4 py-3 font-semibold">{row.product_name}</td>
                <td className="px-4 py-3">{row.variant_name}</td>
                <td className="px-4 py-3">{row.brand}</td>
                <td className="px-4 py-3">{row.category}</td>
                <td className="px-4 py-3 font-bold">{row.wishlist_count}</td>
                <td className="px-4 py-3">
                  <Link className="font-semibold text-sea" href="/admin/products">
                    Update stock
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length ? <div className="p-8 text-center text-stone-600">No wishlist data yet.</div> : null}
    </section>
  );
}

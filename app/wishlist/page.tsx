import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/components/empty-state";
import { getWishlistItems } from "@/lib/data/account";
import { getCurrentUser } from "@/lib/supabase/server";
import { removeFromWishlist } from "@/lib/actions/shop";
import { formatMoney } from "@/lib/utils/format";

export default async function WishlistPage() {
  const [user, items] = await Promise.all([getCurrentUser(), getWishlistItems()]);

  if (!user) {
    return (
      <main className="container-shell py-10">
        <EmptyState title="Sign in required" body="Please sign in to view your wishlist." actionHref="/login" actionLabel="Sign in" />
      </main>
    );
  }

  return (
    <main className="container-shell grid gap-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Wishlist</h1>
        <p className="mt-2 text-stone-600">Out-of-stock products you want us to restock.</p>
      </div>
      {!items.length ? (
        <EmptyState title="Your wishlist is empty" body="Out-of-stock products can be saved here." actionHref="/products" actionLabel="Browse products" />
      ) : (
        <div className="grid gap-3">
          {items.map((item: any) => (
            <article key={item.id} className="grid gap-4 rounded-md border border-stone-200 bg-white p-4 sm:grid-cols-[1fr_auto]">
              <div className="flex gap-4">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-mist">
                  {item.products.image_url ? (
                    <Image
                      src={item.products.image_url}
                      alt={item.products.name}
                      fill
                      sizes="80px"
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-slate-400">No image</div>
                  )}
                </div>
                <div>
                  <Link href={`/products/${item.products.slug}`} className="font-semibold hover:text-sea">
                    {item.products.name}
                  </Link>
                  <p className="mt-1 text-sm text-stone-600">
                    {item.product_variants.variant_name} / {formatMoney(item.product_variants.sale_price ?? item.product_variants.price)}
                  </p>
                </div>
              </div>
              <form action={removeFromWishlist}>
                <input type="hidden" name="wishlist_id" value={item.id} />
                <button className="btn-secondary">Remove</button>
              </form>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}

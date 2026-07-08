import Link from "next/link";
import Image from "next/image";
import { EmptyState } from "@/components/empty-state";
import { getCartItems } from "@/lib/data/account";
import { formatMoney, getVariantPrice } from "@/lib/utils/format";
import { removeCartItem, updateCartItem } from "@/lib/actions/shop";

export default async function CartPage() {
  const items = await getCartItems();
  const total = items.reduce((sum, item) => sum + getVariantPrice(item.product_variants) * item.quantity, 0);

  return (
    <main className="container-shell grid gap-8 py-8">
      <div>
        <h1 className="text-3xl font-bold">Cart</h1>
        <p className="mt-2 text-stone-600">Review items before submitting your pickup reservation.</p>
      </div>
      {!items.length ? (
        <EmptyState title="Your cart is empty" body="Add in-stock products before checkout." actionHref="/products" actionLabel="Shop products" />
      ) : (
        <section className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="grid gap-3">
            {items.map((item) => (
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
                    <h2 className="font-semibold">{item.products.name}</h2>
                    <p className="mt-1 text-sm text-stone-600">{item.product_variants.variant_name}</p>
                    <p className="mt-2 font-semibold">{formatMoney(getVariantPrice(item.product_variants))}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <form action={updateCartItem} className="flex items-center gap-2">
                    <input type="hidden" name="cart_item_id" value={item.id} />
                    <input className="field w-20" type="number" min="1" name="quantity" defaultValue={item.quantity} />
                    <button className="btn-secondary">Update</button>
                  </form>
                  <form action={removeCartItem}>
                    <input type="hidden" name="cart_item_id" value={item.id} />
                    <button className="btn-secondary">Remove</button>
                  </form>
                </div>
              </article>
            ))}
          </div>
          <aside className="h-fit rounded-md border border-stone-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">Reservation summary</h2>
            <div className="mt-4 flex items-center justify-between border-t border-stone-200 pt-4">
              <span className="font-semibold">Estimated total</span>
              <span className="text-xl font-bold">{formatMoney(total)}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-stone-600">Payment is made in store when you collect your order.</p>
            <Link className="btn-primary mt-5 w-full" href="/checkout">
              Continue to checkout
            </Link>
          </aside>
        </section>
      )}
    </main>
  );
}

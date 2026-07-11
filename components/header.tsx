import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Boxes, ClipboardList, Heart, HeartPulse, Home, LayoutDashboard, LogOut, Search, ShoppingCart, UserRound } from "lucide-react";
import { signOut } from "@/lib/actions/auth";
import { HeaderNav } from "@/components/header-nav";
import { siteConfig } from "@/lib/config";
import { getCurrentProfile, getCurrentUser } from "@/lib/supabase/server";

export async function Header() {
  const user = await getCurrentUser();
  const profile = await getCurrentProfile();
  const isAdmin = profile?.role === "admin";

  if (isAdmin) {
    return (
      <>
        <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
          <div className="container-shell flex flex-wrap items-center justify-center gap-2 py-2 sm:justify-between sm:gap-4 sm:py-4">
            <Link href="/admin" className="flex items-center gap-3">
              <Image
                src="/brand/qpet-logo.png"
                alt={siteConfig.storeName}
                width={220}
                height={220}
                className="h-16 w-auto sm:h-28"
                priority
              />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-qpet-dark">Admin</p>
                <p className="font-bold text-ink">Qpet Rhodes</p>
              </div>
            </Link>

            <div className="hidden items-center gap-3 sm:flex">
              <Link href="/account" className="btn-secondary py-2.5">
                <UserRound size={17} />
                Account
              </Link>
              <form action={signOut}>
                <button className="btn-secondary py-2.5" aria-label="Sign out">
                  <LogOut size={17} />
                </button>
              </form>
            </div>
          </div>

          <div className="hidden border-t border-line sm:block">
            <nav className="container-shell flex min-h-14 items-center justify-center gap-2 overflow-x-auto text-sm font-medium">
              <Link href="/admin" className="btn-secondary py-2">
                <LayoutDashboard size={17} />
                Dashboard
              </Link>
              <Link href="/admin/products" className="btn-secondary py-2">
                <Boxes size={17} />
                Products
              </Link>
              <Link href="/admin/orders" className="btn-secondary py-2">
                <ClipboardList size={17} />
                Orders
              </Link>
              <Link href="/admin/wishlist" className="btn-secondary py-2">
                <HeartPulse size={17} />
                Wishlist Demand
              </Link>
            </nav>
          </div>
        </header>
        <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-4 border-t border-line bg-white/95 px-2 py-2 text-[11px] font-semibold text-slate-600 shadow-[0_-8px_30px_rgba(16,24,50,0.08)] backdrop-blur sm:hidden">
          <Link href="/admin" className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
            <LayoutDashboard size={20} />
            Dashboard
          </Link>
          <Link href="/admin/products" className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
            <Boxes size={20} />
            Products
          </Link>
          <Link href="/admin/orders" className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
            <ClipboardList size={20} />
            Orders
          </Link>
          <Link href="/admin/wishlist" className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
            <HeartPulse size={20} />
            Wishlist
          </Link>
        </nav>
      </>
    );
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-shell grid grid-cols-[1fr_auto_1fr] items-center gap-y-1.5 py-1.5 sm:gap-4 sm:py-4 lg:grid-cols-[260px_1fr_300px]">
          <Link href="/" className="col-start-2 flex items-center justify-self-center lg:col-start-auto lg:justify-self-start">
            <Image
              src="/brand/qpet-logo.png"
              alt={siteConfig.storeName}
              width={240}
              height={240}
              className="h-20 w-auto sm:h-28 lg:h-32"
              priority
            />
            <span className="sr-only">{siteConfig.storeName}</span>
          </Link>

          <form action="/products" className="relative col-span-3 order-3 lg:col-span-1 lg:order-none">
            <label className="sr-only" htmlFor="site-search">
              Search products
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search for products..."
              className="h-10 w-full rounded-xl border border-line bg-mist px-5 pr-12 text-sm outline-none transition focus:border-qpet focus:bg-white focus:ring-2 focus:ring-qpet/15 sm:h-12"
            />
            <button
              className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-ink transition hover:text-qpet-dark"
              aria-label="Search"
            >
              <Search size={19} />
            </button>
          </form>

          <div className="col-start-3 row-start-1 flex items-center justify-end gap-4 text-sm font-medium text-ink lg:col-start-auto lg:row-start-auto">
            <Link href={user ? "/account" : "/login"} className="hidden items-center gap-2 transition hover:text-qpet-dark sm:flex">
              <UserRound size={19} />
              Account
            </Link>
            <Link href="/wishlist" className="hidden items-center gap-2 transition hover:text-qpet-dark sm:flex">
              <Heart size={19} />
              Wishlist
            </Link>
            <Link href="/cart" className="hidden items-center gap-2 transition hover:text-qpet-dark sm:flex">
              <ShoppingCart size={19} />
              Cart
            </Link>
            {isAdmin ? (
              <Link href="/admin" className="flex items-center gap-2 transition hover:text-qpet-dark">
                <LayoutDashboard size={19} />
                Admin
              </Link>
            ) : null}
            {user ? (
              <form action={signOut}>
                <button className="flex items-center gap-2 transition hover:text-qpet-dark" aria-label="Sign out">
                  <LogOut size={19} />
                </button>
              </form>
            ) : null}
          </div>
        </div>

        <div className="border-t border-line">
          <Suspense fallback={null}>
            <HeaderNav />
          </Suspense>
        </div>
      </header>
      <nav className="fixed inset-x-0 bottom-0 z-50 grid grid-cols-5 border-t border-line bg-white/95 px-2 py-2 text-[11px] font-semibold text-slate-600 shadow-[0_-8px_30px_rgba(16,24,50,0.08)] backdrop-blur sm:hidden">
        <Link href="/" className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
          <Home size={20} />
          Home
        </Link>
        <Link href="/wishlist" className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
          <Heart size={20} />
          Wishlist
        </Link>
        <Link href="/cart" className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
          <ShoppingCart size={20} />
          Cart
        </Link>
        <Link href="/orders" className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
          <ClipboardList size={20} />
          Order
        </Link>
        <Link href={user ? "/account" : "/login"} className="grid justify-items-center gap-1 rounded-xl px-2 py-1.5 hover:bg-qpet-soft hover:text-qpet-dark">
          <UserRound size={20} />
          Account
        </Link>
      </nav>
    </>
  );
}

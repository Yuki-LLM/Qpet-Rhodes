import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { Boxes, ClipboardList, Heart, HeartPulse, LayoutDashboard, LogOut, Search, ShoppingCart, UserRound } from "lucide-react";
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
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="container-shell flex flex-wrap items-center justify-between gap-4 py-4">
          <Link href="/admin" className="flex items-center gap-3">
            <Image
              src="/brand/qpet-logo.png"
              alt={siteConfig.storeName}
              width={116}
              height={92}
              className="h-14 w-auto"
              priority
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-qpet-dark">Admin</p>
              <p className="font-bold text-ink">Qpet Rhodes</p>
            </div>
          </Link>

          <form action="/admin/products" className="relative min-w-[260px] flex-1 sm:max-w-md">
            <label className="sr-only" htmlFor="admin-search">
              Search products
            </label>
            <input
              id="admin-search"
              name="q"
              type="search"
              placeholder="Search products..."
              className="h-11 w-full rounded-xl border border-line bg-mist px-4 pr-11 text-sm outline-none transition focus:border-qpet focus:bg-white focus:ring-2 focus:ring-qpet/15"
            />
            <button
              className="absolute right-3 top-1/2 flex size-7 -translate-y-1/2 items-center justify-center text-ink transition hover:text-qpet-dark"
              aria-label="Search"
            >
              <Search size={18} />
            </button>
          </form>

          <div className="flex items-center gap-3">
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

        <div className="border-t border-line">
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
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container-shell grid gap-4 py-4 lg:grid-cols-[260px_1fr_300px] lg:items-center">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand/qpet-logo.png"
            alt={siteConfig.storeName}
            width={116}
            height={92}
            className="h-16 w-auto"
            priority
          />
          <span className="sr-only">{siteConfig.storeName}</span>
        </Link>

        <form action="/products" className="relative order-3 lg:order-none">
          <label className="sr-only" htmlFor="site-search">
            Search products
          </label>
          <input
            id="site-search"
            name="q"
            type="search"
            placeholder="Search for products..."
            className="h-12 w-full rounded-xl border border-line bg-mist px-5 pr-12 text-sm outline-none transition focus:border-qpet focus:bg-white focus:ring-2 focus:ring-qpet/15"
          />
          <button
            className="absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-ink transition hover:text-qpet-dark"
            aria-label="Search"
          >
            <Search size={19} />
          </button>
        </form>

        <div className="flex items-center justify-end gap-4 text-sm font-medium text-ink">
          <Link href={user ? "/account" : "/login"} className="hidden items-center gap-2 transition hover:text-qpet-dark sm:flex">
            <UserRound size={19} />
            Account
          </Link>
          <Link href="/wishlist" className="hidden items-center gap-2 transition hover:text-qpet-dark sm:flex">
            <Heart size={19} />
            Wishlist
          </Link>
          <Link href="/cart" className="flex items-center gap-2 transition hover:text-qpet-dark">
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
  );
}

import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Clock, Headphones, Heart, MapPin, Percent, Phone, ShieldCheck, Truck } from "lucide-react";
import { ProductCard } from "@/components/product-card";
import { siteConfig } from "@/lib/config";
import { getProducts } from "@/lib/data/products";
import { getCurrentProfile } from "@/lib/supabase/server";

export default async function HomePage() {
  const profile = await getCurrentProfile();
  if (profile?.role === "admin") redirect("/admin");

  const popularProducts = await getProducts({}, { limit: 5 });

  const categories = [
    { label: "Dog", href: "/products?petType=Dog", image: "/category-images/dog.png" },
    { label: "Cat", href: "/products?petType=Cat", image: "/category-images/cat.png" },
    { label: "Others", href: "/products?category=Treats", image: "/category-images/others.png" }
  ];

  const benefits = [
    { icon: Truck, title: "Local Pickup", text: "Order online & pick up in store" },
    { icon: ShieldCheck, title: "Quality Products", text: "Carefully selected for your pets" },
    { icon: Heart, title: "Trusted by Pet Owners", text: "Loved by pets, trusted by you" },
    { icon: Headphones, title: "Customer Support", text: "We're here to help" }
  ];

  return (
    <main className="bg-white">
      <section className="container-shell pt-8">
        <div className="grid gap-4 rounded-3xl bg-mist p-5 md:grid-cols-[1.2fr_1fr_0.8fr] md:items-center">
          <div className="flex gap-3">
            <MapPin className="mt-1 shrink-0 text-qpet-dark" size={22} />
            <div>
              <p className="text-sm font-bold text-ink">{siteConfig.storeName}</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{siteConfig.address}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Clock className="mt-1 shrink-0 text-qpet-dark" size={22} />
            <div>
              <p className="text-sm font-bold text-ink">Opening Hours</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{siteConfig.pickupHours}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-1 shrink-0 text-qpet-dark" size={22} />
            <div>
              <p className="text-sm font-bold text-ink">Phone</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{siteConfig.phone}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-5 py-8 sm:grid-cols-2 lg:grid-cols-4">
        {benefits.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <div key={benefit.title} className="flex items-center gap-4 rounded-2xl bg-white p-4">
              <Icon className="text-qpet-dark" size={30} />
              <div>
                <h2 className="font-bold text-ink">{benefit.title}</h2>
                <p className="mt-1 text-sm text-slate-500">{benefit.text}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="container-shell grid gap-6 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-ink">Shop by Category</h2>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-qpet-dark">
            View all categories
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.label} href={category.href} className="group relative min-h-36 overflow-hidden rounded-2xl bg-qpet-soft/70 p-6 shadow-sm transition hover:bg-qpet-soft">
              <Image
                src={category.image}
                alt={category.label}
                width={220}
                height={180}
                className="absolute left-3 top-1/2 h-32 w-40 -translate-y-1/2 object-contain opacity-80 mix-blend-multiply transition group-hover:scale-105 group-hover:opacity-95"
              />
              <div className="relative ml-auto grid w-32 gap-3 pt-5">
                <h3 className="text-xl font-bold">{category.label}</h3>
                <span className="inline-flex items-center gap-2 font-semibold text-qpet-dark">
                  Explore
                  <ArrowRight size={17} />
                </span>
              </div>
            </Link>
          ))}
          <Link href="/products?sale=true" className="grid min-h-36 content-center rounded-2xl bg-qpet p-8 text-white shadow-sm">
            <Percent size={44} />
            <h3 className="mt-2 text-xl font-bold">Sale</h3>
            <span className="mt-2 inline-flex items-center gap-2 font-semibold">
              View all deals
              <ArrowRight size={17} />
            </span>
          </Link>
        </div>
      </section>

      <section className="container-shell grid gap-6 py-8">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold text-ink">Popular Products</h2>
          <Link href="/products" className="inline-flex items-center gap-2 text-sm font-semibold text-qpet-dark">
            View all products
            <ArrowRight size={17} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
          {popularProducts.map((product) => (
            <ProductCard key={product.id} product={product} compact />
          ))}
        </div>
      </section>

      <div className="h-8" />
    </main>
  );
}

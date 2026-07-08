import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBrandSummaries } from "@/lib/data/products";

function brandInitials(brand: string) {
  return brand
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

export default async function BrandsPage() {
  const brands = await getBrandSummaries();

  return (
    <main className="container-shell grid gap-8 bg-white py-8">
      <div className="rounded-3xl bg-mist p-8">
        <p className="text-sm font-bold text-qpet-dark">Brands</p>
        <h1 className="mt-2 text-4xl font-bold text-ink">Shop by Brand</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">
          Choose a brand to view every product currently available from that range.
        </p>
      </div>

      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {brands.map((brand) => (
          <Link
            key={brand.brand}
            href={`/products?brand=${encodeURIComponent(brand.brand)}`}
            className="group grid gap-5 rounded-3xl border border-line bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft"
          >
            <div className="flex items-center gap-5">
              <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-qpet-soft text-2xl font-bold text-qpet-dark">
                {brand.imageUrl ? (
                  <Image src={brand.imageUrl} alt={brand.brand} fill sizes="96px" className="object-contain p-4 opacity-80" />
                ) : (
                  brandInitials(brand.brand)
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-ink">{brand.brand}</h2>
                <p className="mt-1 text-sm text-slate-500">{brand.count} products</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 font-bold text-qpet-dark">
              View products
              <ArrowRight size={17} className="transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </section>
    </main>
  );
}

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductPurchasePanel } from "@/components/product-purchase-panel";
import { getProductBySlug } from "@/lib/data/products";

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <main className="container-shell grid gap-8 bg-white py-8">
      <Link href="/products" className="text-sm font-bold text-qpet-dark hover:text-ink">
        Back to products
      </Link>
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative aspect-square rounded-3xl border border-line bg-mist shadow-sm">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-10"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-500">No image</div>
          )}
        </div>
        <div className="grid content-start gap-8">
          <div className="grid gap-5">
            <div className="flex flex-wrap gap-2 text-sm font-bold text-qpet-dark">
              <span>{product.brand}</span>
              <span className="text-slate-300">/</span>
              <span>{product.category}</span>
              {product.pet_type ? (
                <>
                  <span className="text-slate-300">/</span>
                  <span>{product.pet_type}</span>
                </>
              ) : null}
            </div>
            <h1 className="max-w-3xl text-2xl font-bold leading-snug text-ink md:text-3xl lg:text-4xl">{product.name}</h1>
            <ProductPurchasePanel product={product} />
            <p className="max-w-3xl pt-2 leading-8 text-slate-600">
              {product.description ?? "Product details will be updated soon."}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

import { EmptyState } from "@/components/empty-state";
import { ProductCard } from "@/components/product-card";
import { getProductPage } from "@/lib/data/products";
import { getCurrentProfile } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

function getPageHeading(params: Record<string, string | undefined>) {
  if (params.brand) {
    return {
      eyebrow: "Brand",
      title: params.brand,
      body: `Explore all ${params.brand} products available at Qpet Rhodes.`
    };
  }

  if (params.petType === "Dog") {
    return {
      eyebrow: "Dog",
      title: "Dog Products",
      body: "Food and treats selected for dogs, ready for local pickup."
    };
  }

  if (params.petType === "Cat") {
    return {
      eyebrow: "Cat",
      title: "Cat Products",
      body: "Food and treats selected for cats, ready for local pickup."
    };
  }

  if (params.category === "Treats") {
    return {
      eyebrow: "Others",
      title: "Treats & Others",
      body: "Browse treats and other pet essentials ready for local pickup."
    };
  }

  if (params.category) {
    return {
      eyebrow: "Category",
      title: params.category,
      body: `Browse ${params.category.toLowerCase()} products ready for local pickup.`
    };
  }

  if (params.stock === "In Stock") {
    return {
      eyebrow: "Sale",
      title: "Sale Items",
      body: "Browse available deals and reserve items for pickup."
    };
  }

  if (params.q) {
    return {
      eyebrow: "Search",
      title: `Search results for "${params.q}"`,
      body: "Products matching your search are listed below."
    };
  }

  return {
    eyebrow: "Qpet Rhodes",
    title: "All Products",
    body: "Browse premium pet food and treats, then reserve available items for local pickup."
  };
}

function productPageHref(params: Record<string, string | undefined>, page: number) {
  const nextParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value && key !== "page") nextParams.set(key, value);
  });
  if (page > 1) nextParams.set("page", String(page));

  const query = nextParams.toString();
  return query ? `/products?${query}` : "/products";
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const profile = await getCurrentProfile();

  if (profile?.role === "admin") {
    redirect(params.q ? `/admin/products?q=${encodeURIComponent(params.q)}` : "/admin/products");
  }

  const page = Math.max(1, Number(params.page) || 1);
  const pageSize = 48;
  const { products, total, pageCount } = await getProductPage(params, { page, pageSize });
  const safePage = Math.min(page, pageCount);
  const showingStart = total ? (safePage - 1) * pageSize + 1 : 0;
  const showingEnd = Math.min((safePage - 1) * pageSize + products.length, total);
  const heading = getPageHeading(params);

  return (
    <main className="container-shell grid gap-8 bg-white py-8">
      <div className="rounded-3xl bg-mist p-8">
        <p className="text-sm font-bold text-qpet-dark">{heading.eyebrow}</p>
        <h1 className="mt-2 text-4xl font-bold text-ink">{heading.title}</h1>
        <p className="mt-3 max-w-2xl leading-7 text-slate-600">{heading.body}</p>
      </div>
      {products.length ? (
        <>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
            <p className="text-sm font-semibold text-slate-600">
              Showing {showingStart}-{showingEnd} of {total} products
            </p>
            <div className="flex gap-2">
              <Link
                href={productPageHref(params, safePage - 1)}
                aria-disabled={safePage <= 1}
                className={`btn-secondary px-4 py-2 ${safePage <= 1 ? "pointer-events-none opacity-50" : ""}`}
              >
                Previous
              </Link>
              <Link
                href={productPageHref(params, safePage + 1)}
                aria-disabled={safePage >= pageCount}
                className={`btn-primary px-4 py-2 ${safePage >= pageCount ? "pointer-events-none opacity-50" : ""}`}
              >
                Next
              </Link>
            </div>
          </div>
        </>
      ) : (
        <EmptyState title="No products found" body="Try changing your search or filters." />
      )}
    </main>
  );
}

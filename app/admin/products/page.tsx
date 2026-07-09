import Image from "next/image";
import Link from "next/link";
import { ImagePlus, Pencil, Plus, SlidersHorizontal, Trash2 } from "lucide-react";
import { addProductVariant, createProduct, deleteProduct, updateProduct, updateProductVariant } from "@/lib/actions/admin";
import { getAdminProducts } from "@/lib/data/admin";
import { formatMoney, getVariantPrice } from "@/lib/utils/format";

function uniqueValues(values: Array<string | null | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))].sort((a, b) => a.localeCompare(b));
}

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string; brand?: string; category?: string; petType?: string; stock?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const activeFilterCount = [params.brand, params.category, params.petType, params.stock].filter(Boolean).length + (query ? 1 : 0);
  const allProducts = await getAdminProducts();
  const brandOptions = uniqueValues(allProducts.map((product) => product.brand));
  const categoryOptions = uniqueValues(allProducts.map((product) => product.category));
  const petTypeOptions = uniqueValues([
    ...allProducts.map((product) => product.pet_type),
    ...allProducts.flatMap((product) => product.pet_type?.split("/").map((item) => item.trim()) ?? [])
  ]);
  const products = allProducts.filter((product) => {
    const text = `${product.name} ${product.brand} ${product.category} ${product.pet_type ?? ""}`.toLowerCase();
    const matchesQuery = query ? text.includes(query) : true;
    const matchesBrand = params.brand ? product.brand === params.brand : true;
    const matchesCategory = params.category ? product.category === params.category : true;
    const matchesPetType = params.petType ? Boolean(product.pet_type?.includes(params.petType)) : true;
    const matchesStock = params.stock
      ? Boolean(product.product_variants?.some((variant) => variant.stock_status === params.stock))
      : true;

    return matchesQuery && matchesBrand && matchesCategory && matchesPetType && matchesStock;
  });

  return (
    <section className="grid gap-6">
      <datalist id="admin-brand-options">
        {brandOptions.map((brand) => (
          <option key={brand} value={brand} />
        ))}
      </datalist>
      <datalist id="admin-category-options">
        {categoryOptions.map((category) => (
          <option key={category} value={category} />
        ))}
      </datalist>
      <datalist id="admin-pet-type-options">
        {petTypeOptions.map((petType) => (
          <option key={petType} value={petType} />
        ))}
      </datalist>

      <div className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-qpet-dark">
              <SlidersHorizontal size={18} />
              <p className="text-xs font-bold uppercase tracking-[0.16em]">Inventory controls</p>
            </div>
            <h2 className="mt-2 text-xl font-bold text-ink">Products</h2>
            <p className="mt-1 text-sm text-slate-500">Search, filter, and edit product details from one place.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {activeFilterCount ? (
              <Link href="/admin/products" className="btn-secondary px-4 py-2">
                Clear filters
              </Link>
            ) : null}
            <p className="rounded-full bg-qpet-soft px-3 py-1 text-sm font-bold text-qpet-dark">
              {products.length} of {allProducts.length} products
            </p>
          </div>
        </div>
        <form action="/admin/products" className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_1fr_auto]">
          <label className="grid gap-1">
            <span className="label">Search</span>
            <input
              className="field"
              type="search"
              name="q"
              placeholder="Product, brand, category..."
              defaultValue={params.q ?? ""}
            />
          </label>
          <label className="grid gap-1">
            <span className="label">Brand</span>
            <select className="field" name="brand" defaultValue={params.brand ?? ""}>
              <option value="">All brands</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label">Category</span>
            <select className="field" name="category" defaultValue={params.category ?? ""}>
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label">Pet type</span>
            <select className="field" name="petType" defaultValue={params.petType ?? ""}>
              <option value="">All pet types</option>
              {petTypeOptions.map((petType) => (
                <option key={petType} value={petType}>{petType}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1">
            <span className="label">Stock</span>
            <select className="field" name="stock" defaultValue={params.stock ?? ""}>
              <option value="">All stock</option>
              <option value="In Stock">In Stock</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </label>
          <div className="flex gap-2 self-end md:col-span-2 xl:col-span-1">
            <button className="btn-primary h-12 px-5">Apply</button>
          </div>
        </form>
      </div>

      <details className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-5">
        <summary className="cursor-pointer text-lg font-bold text-ink">Add product</summary>
        <form action={createProduct} className="mt-5 grid gap-4 lg:grid-cols-2" encType="multipart/form-data">
          <label className="grid gap-2">
            <span className="label">Product name</span>
            <input className="field" name="name" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Brand</span>
            <input className="field" name="brand" list="admin-brand-options" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Category</span>
            <input className="field" name="category" list="admin-category-options" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Pet type</span>
            <input className="field" name="pet_type" list="admin-pet-type-options" placeholder="Cat, Dog, or Cat / Dog" />
          </label>
          <label className="grid gap-2">
            <span className="label">Variant name</span>
            <input className="field" name="variant_name" defaultValue="Default" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Price</span>
            <input className="field" type="number" step="0.01" name="price" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Sale price</span>
            <input className="field" type="number" step="0.01" name="sale_price" />
          </label>
          <label className="grid gap-2">
            <span className="label">Stock status</span>
            <select className="field" name="stock_status">
              <option>In Stock</option>
              <option>Out of Stock</option>
            </select>
          </label>
          <label className="grid gap-2 lg:col-span-2">
            <span className="label">Description</span>
            <textarea className="field min-h-24" name="description" />
          </label>
          <label className="grid gap-2">
            <span className="label">Source URL</span>
            <input className="field" type="url" name="source_url" />
          </label>
          <label className="grid gap-2">
            <span className="label">Image</span>
            <input className="field" type="file" name="image" accept="image/*" />
          </label>
          <button className="btn-primary lg:col-span-2">Add product</button>
        </form>
      </details>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {products.map((product) => {
          const variants = [...(product.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order);
          const firstVariant = variants[0];

          return (
            <article key={product.id} className="overflow-hidden rounded-xl border border-line bg-white shadow-sm">
              <form action={updateProduct} encType="multipart/form-data" className="grid gap-3 p-3 sm:grid-cols-[132px_1fr]">
                <input type="hidden" name="product_id" value={product.id} />
                <input type="hidden" name="existing_image_url" value={product.image_url ?? ""} />

                <div className="relative aspect-square w-32 max-w-full justify-self-center overflow-hidden rounded-lg bg-mist sm:w-full">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill sizes="132px" className="object-contain p-2" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
                  )}
                  <label className="absolute bottom-2 right-2 inline-flex size-8 cursor-pointer items-center justify-center rounded-full bg-qpet text-white shadow-sm transition hover:bg-qpet-dark" title="Change image">
                    <ImagePlus size={15} />
                    <input className="sr-only" type="file" name="image" accept="image/*" />
                  </label>
                </div>

                <div className="grid gap-2">
                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="label-compact inline-flex items-center gap-1"><Pencil size={12} /> Brand</span>
                      <input className="field-compact" name="brand" list="admin-brand-options" defaultValue={product.brand} required />
                    </label>
                    <label className="grid gap-1">
                      <span className="label-compact inline-flex items-center gap-1"><Pencil size={12} /> Category</span>
                      <input className="field-compact" name="category" list="admin-category-options" defaultValue={product.category} required />
                    </label>
                  </div>

                  <label className="grid gap-1">
                    <span className="label-compact inline-flex items-center gap-1"><Pencil size={12} /> Product title</span>
                    <input className="field-compact font-bold" name="name" defaultValue={product.name} required />
                  </label>

                  <label className="grid gap-1">
                    <span className="label-compact inline-flex items-center gap-1"><Pencil size={12} /> Description</span>
                    <textarea className="field-compact min-h-14 py-2" name="description" defaultValue={product.description ?? ""} />
                  </label>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="label-compact">Pet type</span>
                      <input className="field-compact" name="pet_type" list="admin-pet-type-options" defaultValue={product.pet_type ?? ""} />
                    </label>
                    <label className="grid gap-1">
                      <span className="label-compact">Source URL</span>
                      <input className="field-compact" type="url" name="source_url" defaultValue={product.source_url ?? ""} />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-mist/70 p-2">
                    <p className="text-xs text-slate-500">
                      From <span className="font-bold text-ink">{firstVariant ? formatMoney(getVariantPrice(firstVariant)) : "No price"}</span>
                    </p>
                    <button className="btn-primary px-3 py-2 text-xs">Save product</button>
                  </div>
                </div>
              </form>

              <div className="border-t border-line bg-mist/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm font-bold">Variants</h3>
                  <span className="hidden text-xs text-slate-500 sm:inline">Size, price, sale, stock</span>
                </div>

                <div className="mt-2 grid gap-2">
                  {variants.map((variant) => (
                    <form
                      key={variant.id}
                      action={updateProductVariant}
                      className="grid gap-2 rounded-lg border border-line bg-white p-2 xl:grid-cols-[1fr_76px_76px_102px_52px_auto]"
                    >
                      <input type="hidden" name="variant_id" value={variant.id} />
                      <label className="grid gap-1">
                        <span className="label-compact inline-flex items-center gap-1"><Pencil size={12} /> Size</span>
                        <input className="field-compact" name="variant_name" defaultValue={variant.variant_name} />
                      </label>
                      <label className="grid gap-1">
                        <span className="label-compact inline-flex items-center gap-1"><Pencil size={12} /> Price</span>
                        <input className="field-compact" type="number" step="0.01" name="price" defaultValue={variant.price} />
                      </label>
                      <label className="grid gap-1">
                        <span className="label-compact">Sale</span>
                        <input className="field-compact" type="number" step="0.01" name="sale_price" defaultValue={variant.sale_price ?? ""} />
                      </label>
                      <label className="grid gap-1">
                        <span className="label-compact">Stock</span>
                        <select className="field-compact" name="stock_status" defaultValue={variant.stock_status}>
                          <option>In Stock</option>
                          <option>Out of Stock</option>
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="label-compact">Order</span>
                        <input className="field-compact" type="number" name="sort_order" defaultValue={variant.sort_order} />
                      </label>
                      <button className="btn-secondary self-end px-3 py-2 text-xs">Save</button>
                    </form>
                  ))}

                  <form action={addProductVariant} className="grid gap-2 rounded-lg border border-dashed border-qpet/50 bg-white p-2 xl:grid-cols-[1fr_76px_76px_102px_52px_auto]">
                    <input type="hidden" name="product_id" value={product.id} />
                    <label className="grid gap-1">
                      <span className="label-compact">New size</span>
                      <input className="field-compact" name="variant_name" placeholder="1kg / Blue" required />
                    </label>
                    <label className="grid gap-1">
                      <span className="label-compact">Price</span>
                      <input className="field-compact" type="number" step="0.01" name="price" required />
                    </label>
                    <label className="grid gap-1">
                      <span className="label-compact">Sale</span>
                      <input className="field-compact" type="number" step="0.01" name="sale_price" />
                    </label>
                    <label className="grid gap-1">
                      <span className="label-compact">Stock</span>
                      <select className="field-compact" name="stock_status">
                        <option>In Stock</option>
                        <option>Out of Stock</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="label-compact">Order</span>
                      <input className="field-compact" type="number" name="sort_order" defaultValue={variants.length} />
                    </label>
                    <button className="btn-primary self-end px-3 py-2 text-xs">
                      <Plus size={14} />
                      Add
                    </button>
                  </form>
                </div>
              </div>

              <form action={deleteProduct} className="border-t border-line p-3">
                <input type="hidden" name="product_id" value={product.id} />
                <button className="btn-secondary px-3 py-2 text-xs text-clay hover:border-clay hover:text-clay">
                  <Trash2 size={14} />
                  Hide product
                </button>
              </form>
            </article>
          );
        })}
      </div>
    </section>
  );
}

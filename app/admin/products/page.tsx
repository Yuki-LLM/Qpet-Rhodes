import Image from "next/image";
import { ImagePlus, Pencil, Plus, Trash2 } from "lucide-react";
import { addProductVariant, createProduct, deleteProduct, updateProduct, updateProductVariant } from "@/lib/actions/admin";
import { getAdminProducts } from "@/lib/data/admin";
import { formatMoney, getVariantPrice } from "@/lib/utils/format";

export default async function AdminProductsPage({
  searchParams
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const query = params.q?.trim().toLowerCase() ?? "";
  const products = (await getAdminProducts()).filter((product) => {
    if (!query) return true;
    const text = `${product.name} ${product.brand} ${product.category} ${product.pet_type ?? ""}`.toLowerCase();
    return text.includes(query);
  });

  return (
    <section className="grid gap-6">
      <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Find product</h2>
        <form action="/admin/products" className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            className="field"
            type="search"
            name="q"
            placeholder="Search by product, brand, category, or pet type"
            defaultValue={params.q ?? ""}
          />
          <button className="btn-primary sm:w-36">Search</button>
        </form>
        {query ? <p className="mt-3 text-sm text-slate-600">{products.length} matching products</p> : null}
      </div>

      <details className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
        <summary className="cursor-pointer text-xl font-semibold">Add product</summary>
        <form action={createProduct} className="mt-5 grid gap-4 lg:grid-cols-2" encType="multipart/form-data">
          <label className="grid gap-2">
            <span className="label">Product name</span>
            <input className="field" name="name" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Brand</span>
            <input className="field" name="brand" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Category</span>
            <input className="field" name="category" required />
          </label>
          <label className="grid gap-2">
            <span className="label">Pet type</span>
            <input className="field" name="pet_type" placeholder="Cat, Dog, or Cat / Dog" />
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
            <article key={product.id} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
              <form action={updateProduct} encType="multipart/form-data" className="grid gap-5 p-4 md:grid-cols-[220px_1fr]">
                <input type="hidden" name="product_id" value={product.id} />
                <input type="hidden" name="existing_image_url" value={product.image_url ?? ""} />

                <div className="relative aspect-square overflow-hidden rounded-2xl bg-mist">
                  {product.image_url ? (
                    <Image src={product.image_url} alt={product.name} fill sizes="220px" className="object-contain p-5" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-slate-500">No image</div>
                  )}
                  <label className="absolute bottom-3 right-3 inline-flex size-11 cursor-pointer items-center justify-center rounded-full bg-qpet text-white shadow-sm transition hover:bg-qpet-dark" title="Change image">
                    <ImagePlus size={19} />
                    <input className="sr-only" type="file" name="image" accept="image/*" />
                  </label>
                </div>

                <div className="grid gap-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="label inline-flex items-center gap-1"><Pencil size={14} /> Brand</span>
                      <input className="field" name="brand" defaultValue={product.brand} required />
                    </label>
                    <label className="grid gap-1">
                      <span className="label inline-flex items-center gap-1"><Pencil size={14} /> Category</span>
                      <input className="field" name="category" defaultValue={product.category} required />
                    </label>
                  </div>

                  <label className="grid gap-1">
                    <span className="label inline-flex items-center gap-1"><Pencil size={14} /> Product title</span>
                    <input className="field text-base font-bold" name="name" defaultValue={product.name} required />
                  </label>

                  <label className="grid gap-1">
                    <span className="label inline-flex items-center gap-1"><Pencil size={14} /> Description</span>
                    <textarea className="field min-h-24" name="description" defaultValue={product.description ?? ""} />
                  </label>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1">
                      <span className="label">Pet type</span>
                      <input className="field" name="pet_type" defaultValue={product.pet_type ?? ""} />
                    </label>
                    <label className="grid gap-1">
                      <span className="label">Source URL</span>
                      <input className="field" type="url" name="source_url" defaultValue={product.source_url ?? ""} />
                    </label>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-500">
                      From <span className="font-bold text-ink">{firstVariant ? formatMoney(getVariantPrice(firstVariant)) : "No price"}</span>
                    </p>
                    <button className="btn-primary py-2.5">Save product</button>
                  </div>
                </div>
              </form>

              <div className="border-t border-line bg-mist/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">Variants</h3>
                  <span className="text-sm text-slate-500">Size, color, price, sale, and stock</span>
                </div>

                <div className="mt-4 grid gap-3">
                  {variants.map((variant) => (
                    <form
                      key={variant.id}
                      action={updateProductVariant}
                      className="grid gap-3 rounded-xl border border-line bg-white p-3 lg:grid-cols-[1fr_120px_120px_150px_90px_auto]"
                    >
                      <input type="hidden" name="variant_id" value={variant.id} />
                      <label className="grid gap-1">
                        <span className="label inline-flex items-center gap-1"><Pencil size={14} /> Size / color</span>
                        <input className="field" name="variant_name" defaultValue={variant.variant_name} />
                      </label>
                      <label className="grid gap-1">
                        <span className="label inline-flex items-center gap-1"><Pencil size={14} /> Price</span>
                        <input className="field" type="number" step="0.01" name="price" defaultValue={variant.price} />
                      </label>
                      <label className="grid gap-1">
                        <span className="label">Sale price</span>
                        <input className="field" type="number" step="0.01" name="sale_price" defaultValue={variant.sale_price ?? ""} />
                      </label>
                      <label className="grid gap-1">
                        <span className="label">Stock</span>
                        <select className="field" name="stock_status" defaultValue={variant.stock_status}>
                          <option>In Stock</option>
                          <option>Out of Stock</option>
                        </select>
                      </label>
                      <label className="grid gap-1">
                        <span className="label">Order</span>
                        <input className="field" type="number" name="sort_order" defaultValue={variant.sort_order} />
                      </label>
                      <button className="btn-secondary self-end py-3">Save</button>
                    </form>
                  ))}

                  <form action={addProductVariant} className="grid gap-3 rounded-xl border border-dashed border-qpet/50 bg-white p-3 lg:grid-cols-[1fr_120px_120px_150px_90px_auto]">
                    <input type="hidden" name="product_id" value={product.id} />
                    <label className="grid gap-1">
                      <span className="label">New size / color</span>
                      <input className="field" name="variant_name" placeholder="Example: 1kg / Blue" required />
                    </label>
                    <label className="grid gap-1">
                      <span className="label">Price</span>
                      <input className="field" type="number" step="0.01" name="price" required />
                    </label>
                    <label className="grid gap-1">
                      <span className="label">Sale price</span>
                      <input className="field" type="number" step="0.01" name="sale_price" />
                    </label>
                    <label className="grid gap-1">
                      <span className="label">Stock</span>
                      <select className="field" name="stock_status">
                        <option>In Stock</option>
                        <option>Out of Stock</option>
                      </select>
                    </label>
                    <label className="grid gap-1">
                      <span className="label">Order</span>
                      <input className="field" type="number" name="sort_order" defaultValue={variants.length} />
                    </label>
                    <button className="btn-primary self-end py-3">
                      <Plus size={17} />
                      Add
                    </button>
                  </form>
                </div>
              </div>

              <form action={deleteProduct} className="border-t border-line p-4">
                <input type="hidden" name="product_id" value={product.id} />
                <button className="btn-secondary py-2.5 text-clay hover:border-clay hover:text-clay">
                  <Trash2 size={17} />
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

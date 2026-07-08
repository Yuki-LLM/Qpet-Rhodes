import { createProduct, deleteProduct, updateProduct, updateProductVariant } from "@/lib/actions/admin";
import { getAdminProducts } from "@/lib/data/admin";

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

      <div className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
        <h2 className="text-xl font-semibold">Add product</h2>
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
      </div>

      <div className="grid gap-4">
        {products.map((product) => (
          <article key={product.id} className="rounded-md border border-stone-200 bg-white p-5 shadow-sm">
            <form action={updateProduct} className="grid gap-4 lg:grid-cols-2" encType="multipart/form-data">
              <input type="hidden" name="product_id" value={product.id} />
              <input type="hidden" name="existing_image_url" value={product.image_url ?? ""} />
              <label className="grid gap-2">
                <span className="label">Product name</span>
                <input className="field" name="name" defaultValue={product.name} required />
              </label>
              <label className="grid gap-2">
                <span className="label">Brand</span>
                <input className="field" name="brand" defaultValue={product.brand} required />
              </label>
              <label className="grid gap-2">
                <span className="label">Category</span>
                <input className="field" name="category" defaultValue={product.category} required />
              </label>
              <label className="grid gap-2">
                <span className="label">Pet type</span>
                <input className="field" name="pet_type" defaultValue={product.pet_type ?? ""} />
              </label>
              <label className="grid gap-2 lg:col-span-2">
                <span className="label">Description</span>
                <textarea className="field min-h-24" name="description" defaultValue={product.description ?? ""} />
              </label>
              <label className="grid gap-2">
                <span className="label">Source URL</span>
                <input className="field" type="url" name="source_url" defaultValue={product.source_url ?? ""} />
              </label>
              <label className="grid gap-2">
                <span className="label">Change image</span>
                <input className="field" type="file" name="image" accept="image/*" />
              </label>
              <div className="flex flex-wrap gap-2 lg:col-span-2">
                <button className="btn-primary">Save product</button>
              </div>
            </form>

            <div className="mt-5 grid gap-3 border-t border-stone-200 pt-5">
              <h3 className="font-semibold">Variants</h3>
              {product.product_variants?.map((variant) => (
                <form key={variant.id} action={updateProductVariant} className="grid gap-3 rounded-md bg-stone-50 p-3 lg:grid-cols-[1fr_120px_120px_150px_100px_auto]">
                  <input type="hidden" name="variant_id" value={variant.id} />
                  <input className="field" name="variant_name" defaultValue={variant.variant_name} aria-label="Variant name" />
                  <input className="field" type="number" step="0.01" name="price" defaultValue={variant.price} aria-label="Price" />
                  <input className="field" type="number" step="0.01" name="sale_price" defaultValue={variant.sale_price ?? ""} aria-label="Sale price" />
                  <select className="field" name="stock_status" defaultValue={variant.stock_status} aria-label="Stock status">
                    <option>In Stock</option>
                    <option>Out of Stock</option>
                  </select>
                  <input className="field" type="number" name="sort_order" defaultValue={variant.sort_order} aria-label="Sort order" />
                  <button className="btn-secondary">Save</button>
                </form>
              ))}
            </div>

            <form action={deleteProduct} className="mt-4">
              <input type="hidden" name="product_id" value={product.id} />
              <button className="btn-secondary">Delete product</button>
            </form>
          </article>
        ))}
      </div>
    </section>
  );
}

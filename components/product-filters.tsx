import { Search } from "lucide-react";

type FilterOptions = {
  brands: string[];
  categories: string[];
  petTypes: string[];
};

export function ProductFilters({
  options,
  defaults
}: {
  options: FilterOptions;
  defaults: Record<string, string | undefined>;
}) {
  return (
    <form className="grid gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm lg:grid-cols-[1fr_180px_180px_160px_150px_auto]">
      <label className="relative">
        <span className="sr-only">Search products</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-qpet-dark" size={17} />
        <input
          className="field pl-11"
          type="search"
          name="q"
          defaultValue={defaults.q}
          placeholder="Search products"
        />
      </label>
      <select className="field" name="brand" defaultValue={defaults.brand ?? ""} aria-label="Brand">
        <option value="">All brands</option>
        {options.brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
      <select className="field" name="category" defaultValue={defaults.category ?? ""} aria-label="Category">
        <option value="">All categories</option>
        {options.categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <select className="field" name="petType" defaultValue={defaults.petType ?? ""} aria-label="Pet type">
        <option value="">All pets</option>
        {options.petTypes.map((petType) => (
          <option key={petType} value={petType}>
            {petType}
          </option>
        ))}
      </select>
      <select className="field" name="stock" defaultValue={defaults.stock ?? ""} aria-label="Stock">
        <option value="">Any stock</option>
        <option value="In Stock">In Stock</option>
        <option value="Out of Stock">Out of Stock</option>
      </select>
      <button className="btn-primary">Filter</button>
    </form>
  );
}

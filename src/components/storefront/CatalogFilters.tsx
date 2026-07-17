import type { CatalogFilterOptions } from "@/lib/catalog/query";

type Props = {
  basePath: string;
  options: CatalogFilterOptions;
  selected: {
    minPrice?: string;
    maxPrice?: string;
    brand: string[];
    size: string[];
    color: string[];
    onSale?: string;
    sort?: string;
  };
};

export function CatalogFilters({ basePath, options, selected }: Props) {
  return (
    <details className="catalog-filter-shell">
      <summary><span>☷ Filtr va saralash</span><small>Natijani aniqlashtirish</small></summary>
    <form method="get" action={basePath} className="catalog-filter-form">
      <div className="flex flex-col gap-2">
        <span className="font-semibold">Narx oralig&apos;i</span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            name="minPrice"
            placeholder="Dan"
            defaultValue={selected.minPrice}
            className="w-full rounded border border-black/20 px-2 py-1"
          />
          <span>—</span>
          <input
            type="number"
            name="maxPrice"
            placeholder="Gacha"
            defaultValue={selected.maxPrice}
            className="w-full rounded border border-black/20 px-2 py-1"
          />
        </div>
      </div>

      {options.brands.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Brend</span>
          {options.brands.map((b) => (
            <label key={b.slug} className="flex items-center gap-2">
              <input
                type="checkbox"
                name="brand"
                value={b.slug}
                defaultChecked={selected.brand.includes(b.slug)}
              />
              {b.name}
            </label>
          ))}
        </div>
      )}

      {options.sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-semibold">O&apos;lcham</span>
          <div className="flex flex-wrap gap-2">
            {options.sizes.map((s) => (
              <label
                key={s}
                className="flex items-center gap-1 rounded border border-black/20 px-2 py-1"
              >
                <input
                  type="checkbox"
                  name="size"
                  value={s}
                  defaultChecked={selected.size.includes(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>
      )}

      {options.colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="font-semibold">Rang</span>
          <div className="flex flex-wrap gap-2">
            {options.colors.map((c) => (
              <label
                key={c}
                className="flex items-center gap-1 rounded border border-black/20 px-2 py-1"
              >
                <input
                  type="checkbox"
                  name="color"
                  value={c}
                  defaultChecked={selected.color.includes(c)}
                />
                {c}
              </label>
            ))}
          </div>
        </div>
      )}

      <label className="flex items-center gap-2 font-semibold">
        <input
          type="checkbox"
          name="onSale"
          value="1"
          defaultChecked={selected.onSale === "1"}
        />
        Faqat chegirmadagilar
      </label>

      <div className="flex flex-col gap-2">
        <span className="font-semibold">Saralash</span>
        <select
          name="sort"
          defaultValue={selected.sort ?? "newest"}
          className="rounded border border-black/20 px-2 py-1"
        >
          <option value="newest">Eng yangi</option>
          <option value="price_asc">Arzon narx</option>
          <option value="price_desc">Qimmat narx</option>
        </select>
      </div>

      <button
        type="submit"
        className="rounded bg-black px-4 py-2 font-medium text-white hover:bg-[#8DC63F]"
      >
        Filtrlash
      </button>
    </form>
    </details>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { products } from "@/data/mock";
import { ProductCard } from "@/components/ProductCard";
import { SlidersHorizontal, Grid3x3, List, ChevronDown, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type ShopSearch = { q?: string; category?: string; size?: string };

export const Route = createFileRoute("/_shop/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    category: typeof s.category === "string" ? s.category : undefined,
    size: typeof s.size === "string" ? s.size : undefined,
  }),
  head: () => ({ meta: [{ title: "Shop Handmade Kurti — Nongor" }, { name: "description", content: "Browse our handmade kurti collection." }] }),
  component: Shop,
});

const collections = ["Handmade Kurti", "New Arrival", "Best Seller", "Festive Collection"];

function Shop() {
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [size, setSize] = useState<string[]>([]);
  const [color, setColor] = useState<string[]>([]);
function Shop() {
  const search = Route.useSearch();
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState(search.q ?? "");
  const [size, setSize] = useState<string[]>(search.size ? [search.size] : []);

  const filtered = useMemo(() => {
    let r = products.filter((p) => {
      const price = p.discountPrice ?? p.price;
      if (size.length && !p.sizes.some((s) => size.includes(s))) return false;
      if (color.length && !p.colors.some((c) => color.includes(c.name))) return false;
      if (fabric.length && !fabric.includes(p.fabric)) return false;
      if (collection.length && !p.collection.some((c) => collection.includes(c))) return false;
      if (price > priceMax) return false;
      return true;
    });
    if (sort === "low") r = r.sort((a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price));
    if (sort === "high") r = r.sort((a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price));
    if (sort === "best") r = r.sort((a, b) => b.reviewCount - a.reviewCount);
    return r;
  }, [sort, size, color, fabric, collection, priceMax]);

  const toggle = (arr: string[], set: (v: string[]) => void, v: string) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const Filters = (
    <div className="space-y-6 text-sm">
      <FilterGroup title="Collection">
        {collections.map((c) => (
          <Check key={c} label={c} checked={collection.includes(c)} onChange={() => toggle(collection, setCollection, c)} />
        ))}
      </FilterGroup>
      <FilterGroup title="Size">
        <div className="flex flex-wrap gap-2">
          {allSizes.map((s) => (
            <button key={s} onClick={() => toggle(size, setSize, s)} className={`h-9 w-9 rounded-md border text-xs font-medium transition ${size.includes(s) ? "bg-maroon text-primary-foreground border-maroon" : "border-border hover:border-maroon"}`}>{s}</button>
          ))}
        </div>
      </FilterGroup>
      <FilterGroup title="Color">
        {allColors.map((c) => <Check key={c} label={c} checked={color.includes(c)} onChange={() => toggle(color, setColor, c)} />)}
      </FilterGroup>
      <FilterGroup title="Fabric">
        {allFabrics.map((c) => <Check key={c} label={c} checked={fabric.includes(c)} onChange={() => toggle(fabric, setFabric, c)} />)}
      </FilterGroup>
      <FilterGroup title="Price">
        <div className="text-xs text-muted-foreground">Up to ৳{priceMax}</div>
        <input type="range" min={1000} max={5000} step={100} value={priceMax} onChange={(e) => setPriceMax(+e.target.value)} className="w-full accent-maroon mt-2" />
      </FilterGroup>
    </div>
  );

  return (
    <div className="container-narrow py-8 md:py-12">
      <div>
        <div className="text-xs uppercase tracking-[0.3em] text-gold">All Products</div>
        <h1 className="mt-2 font-display text-3xl md:text-5xl">Handmade Kurti Collection</h1>
        <p className="mt-2 text-muted-foreground text-sm md:text-base">{filtered.length} pieces · hand-stitched in Bangladesh</p>
      </div>

      <div className="mt-8 grid lg:grid-cols-[260px_1fr] gap-8">
        <aside className="hidden lg:block sticky top-24 self-start max-h-[calc(100vh-7rem)] overflow-auto pr-2">{Filters}</aside>
        <div>
          <div className="flex items-center gap-3 justify-between mb-5">
            <Sheet>
              <SheetTrigger className="lg:hidden inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border text-sm">
                <SlidersHorizontal className="h-4 w-4" /> Filters
              </SheetTrigger>
              <SheetContent side="left" className="w-[85%] overflow-y-auto bg-ivory">
                <h3 className="font-display text-xl mb-4">Filters</h3>
                {Filters}
              </SheetContent>
            </Sheet>
            <div className="flex items-center gap-2 ml-auto">
              <div className="hidden md:flex items-center bg-card rounded-full border border-border p-1">
                <button onClick={() => setView("grid")} className={`h-8 w-8 grid place-items-center rounded-full ${view === "grid" ? "bg-maroon text-primary-foreground" : ""}`}><Grid3x3 className="h-4 w-4" /></button>
                <button onClick={() => setView("list")} className={`h-8 w-8 grid place-items-center rounded-full ${view === "list" ? "bg-maroon text-primary-foreground" : ""}`}><List className="h-4 w-4" /></button>
              </div>
              <div className="relative">
                <select value={sort} onChange={(e) => setSort(e.target.value)} className="appearance-none bg-card border border-border rounded-full pl-4 pr-9 py-2 text-sm">
                  <option value="newest">Newest</option>
                  <option value="low">Price: Low → High</option>
                  <option value="high">Price: High → Low</option>
                  <option value="best">Best Selling</option>
                </select>
                <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="bg-card rounded-2xl p-16 text-center">
              <div className="font-display text-2xl">No pieces found</div>
              <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters.</p>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {filtered.map((p) => <ProductCard key={p.id} p={p} />)}
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((p) => (
                <div key={p.id} className="bg-card rounded-2xl p-4 flex gap-4 shadow-soft">
                  <img src={p.images[0]} className="h-32 w-24 md:h-40 md:w-32 object-cover rounded-lg" alt={p.name} />
                  <div className="flex-1">
                    <h3 className="font-display text-lg">{p.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{p.description}</p>
                    <div className="mt-3 font-display text-lg text-maroon">৳{p.discountPrice ?? p.price}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-xl p-4 border border-border/60">
      <h4 className="font-display text-base mb-3 text-maroon">{title}</h4>
      <div className="space-y-2">{children}</div>
    </div>
  );
}
function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer text-foreground/85 hover:text-maroon">
      <input type="checkbox" checked={checked} onChange={onChange} className="accent-maroon h-4 w-4" />
      <span>{label}</span>
    </label>
  );
}

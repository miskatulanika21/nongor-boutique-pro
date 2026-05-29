import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { taka } from "@/lib/format";
import { getStock, isOutOfStock, isLowStock } from "@/lib/stock";
import { Heart, ShoppingBag, Truck, RotateCcw, ShieldCheck, Sparkles, Minus, Plus, AlertTriangle, Share2, ZoomIn } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { useShop } from "@/store/shop";
import { useProductBySlug, usePublishedProducts } from "@/hooks/useProducts";
import { ProductCard } from "@/components/ProductCard";
import { toast } from "sonner";
import { useNavigate } from "@tanstack/react-router";
import { pushRecentlyViewed, getRecentlyViewed } from "@/lib/recently-viewed";

import type { Product as ProductType } from "@/data/mock";

export const Route = createFileRoute("/_shop/product/$slug")({
  head: () => ({
    meta: [{ title: "Product — Nongor" }],
  }),
  component: Product,
});

function Product() {
  const { slug } = Route.useParams();
  const { product: p } = useProductBySlug(slug);
  const { products: allPublished } = usePublishedProducts();
  if (!p) return <div className="container-narrow py-20 text-center"><h1 className="font-display text-3xl">Product not found</h1></div>;

  const shop = useShop();
  const nav = useNavigate();
  const [size, setSize] = useState(p.sizes[1] ?? p.sizes[0]);
  const [color, setColor] = useState(p.colors[0].name);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number } | null>(null);
  const price = p.discountPrice ?? p.price;
  const related = allPublished.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);

  useEffect(() => { pushRecentlyViewed(p.id); }, [p.id]);
  const recentIds = getRecentlyViewed().filter((id) => id !== p.id);
  const recentlyViewed = allPublished.filter((x) => recentIds.includes(x.id)).slice(0, 4);

  const stock = getStock(p, size, color);
  const outOfStock = isOutOfStock(p, size, color);
  const lowStock = isLowStock(p, size, color);

  const add = () => {
    if (outOfStock) return;
    shop.addToCart({ productId: p.id, slug: p.slug, name: p.name, image: p.images[0], price, size, color, qty: Math.min(qty, stock) });
    toast.success("Added to bag");
  };
  const buyNow = () => { add(); nav({ to: "/checkout" }); };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const shareData = { title: p.name, text: `${p.name} — Nongor`, url };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(shareData);
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // user dismissed share
    }
  };

  return (
    <div className="container-narrow py-6 md:py-12">
      <nav className="text-xs text-muted-foreground mb-6">
        <Link to="/" className="hover:text-maroon">Home</Link> · <Link to="/shop" className="hover:text-maroon">Shop</Link> · <span className="text-foreground">{p.name}</span>
      </nav>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-14">
        <div>
          <div
            className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-cream shadow-soft group cursor-zoom-in"
            onMouseMove={(e) => {
              const r = e.currentTarget.getBoundingClientRect();
              setZoomPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
            }}
            onMouseLeave={() => setZoomPos(null)}
          >
            <img
              src={p.images[activeImg]}
              alt={p.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-soft"
              style={zoomPos ? { transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`, transform: "scale(1.8)" } : undefined}
            />
            <div className="absolute top-3 right-3 h-8 w-8 grid place-items-center rounded-full bg-ivory/85 backdrop-blur text-maroon shadow-soft opacity-0 group-hover:opacity-100 transition pointer-events-none">
              <ZoomIn className="h-4 w-4" />
            </div>
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`h-20 w-16 rounded-lg overflow-hidden border-2 transition ${activeImg === i ? "border-maroon" : "border-transparent hover:border-gold/60"}`}>
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {p.isBestSeller && <span className="inline-flex items-center gap-1 text-xs text-maroon bg-cream px-3 py-1 rounded-full"><Sparkles className="h-3 w-3 text-gold" /> Best Seller</span>}
          <h1 className="mt-3 font-display text-3xl md:text-5xl text-foreground">{p.name}</h1>
          {p.bnName && <div className="font-bengali text-lg text-muted-foreground mt-1">{p.bnName}</div>}
          <div className="mt-3 flex items-center gap-3 text-sm">
            <span className="text-gold">{"★".repeat(Math.round(p.rating))}</span>
            <span className="text-muted-foreground">{p.rating} · {p.reviewCount} reviews</span>
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl text-maroon font-semibold">{taka(price)}</span>
            {p.discountPrice && <><span className="text-lg text-muted-foreground line-through">{taka(p.price)}</span><span className="text-xs bg-maroon text-primary-foreground px-2 py-0.5 rounded">Save {taka(p.price - p.discountPrice)}</span></>}
          </div>
          <p className="mt-5 text-foreground/80 leading-relaxed">{p.description}</p>

          <div className="mt-6 space-y-5">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Size</span>
                <Dialog>
                  <DialogTrigger className="text-xs text-maroon underline">Size guide</DialogTrigger>
                  <DialogContent>
                    <DialogTitle className="font-display text-2xl">Size Guide</DialogTitle>
                    <table className="w-full text-sm mt-4">
                      <thead><tr className="text-left border-b"><th className="py-2">Size</th><th>Bust</th><th>Waist</th><th>Length</th></tr></thead>
                      <tbody>
                        {[["S","34","28","42"],["M","36","30","43"],["L","38","32","44"],["XL","40","34","45"],["XXL","42","36","46"]].map((r) => (
                          <tr key={r[0]} className="border-b border-border/50"><td className="py-2 font-semibold">{r[0]}</td><td>{r[1]}"</td><td>{r[2]}"</td><td>{r[3]}"</td></tr>
                        ))}
                      </tbody>
                    </table>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="flex gap-2">
                {p.sizes.map((s) => (
                  <button key={s} onClick={() => setSize(s)} className={`h-11 w-11 rounded-lg border text-sm font-medium transition ${size === s ? "bg-maroon text-primary-foreground border-maroon" : "border-border hover:border-maroon"}`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="text-sm font-medium mb-2">Color: <span className="text-muted-foreground">{color}</span></div>
              <div className="flex gap-2">
                {p.colors.map((c) => (
                  <button key={c.name} onClick={() => setColor(c.name)} className={`h-9 w-9 rounded-full border-2 transition ${color === c.name ? "border-maroon ring-2 ring-maroon/30" : "border-border"}`} style={{ background: c.hex }} title={c.name} />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-border rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} disabled={outOfStock} className="h-11 w-11 grid place-items-center disabled:opacity-30"><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center font-medium">{qty}</span>
                <button onClick={() => setQty(Math.min(stock, qty + 1))} disabled={outOfStock || qty >= stock} className="h-11 w-11 grid place-items-center disabled:opacity-30"><Plus className="h-4 w-4" /></button>
              </div>
              <div className="text-xs">
                {outOfStock ? (
                  <div className="font-medium text-destructive flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Out of stock</div>
                ) : lowStock ? (
                  <div className="font-medium text-amber-600 flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> Only {stock} left!</div>
                ) : (
                  <div className="font-medium text-maroon">{stock} in stock</div>
                )}
                <div className="text-muted-foreground">Fabric: {p.fabric}</div>
              </div>
            </div>
          </div>

          <div className="mt-7 flex gap-3">
            <button onClick={add} disabled={outOfStock} className="flex-1 bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-full py-4 font-semibold tracking-wide flex items-center justify-center gap-2 transition shadow-elegant disabled:opacity-50 disabled:cursor-not-allowed">
              <ShoppingBag className="h-4 w-4" /> {outOfStock ? "Out of Stock" : "Add to Bag"}
            </button>
            <button onClick={buyNow} disabled={outOfStock} className="flex-1 border-2 border-maroon text-maroon hover:bg-maroon hover:text-primary-foreground rounded-full py-4 font-semibold tracking-wide transition disabled:opacity-50 disabled:cursor-not-allowed">Buy Now</button>
            <button onClick={() => shop.toggleWishlist(p.id)} className="h-14 w-14 rounded-full border border-border grid place-items-center hover:border-maroon transition" aria-label="Add to wishlist">
              <Heart className={`h-5 w-5 ${shop.wishlist.includes(p.id) ? "fill-maroon text-maroon" : ""}`} />
            </button>
            <button onClick={share} className="h-14 w-14 rounded-full border border-border grid place-items-center hover:border-maroon transition" aria-label="Share product">
              <Share2 className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-2 text-[11px] md:text-xs">
            <Feature icon={Truck} label="Delivery in 2-5 days" />
            <Feature icon={RotateCcw} label="7-day exchange" />
            <Feature icon={ShieldCheck} label="Quality assured" />
          </div>

          <Tabs defaultValue="fabric" className="mt-8">
            <TabsList className="bg-cream">
              <TabsTrigger value="fabric">Fabric & Care</TabsTrigger>
              <TabsTrigger value="delivery">Delivery</TabsTrigger>
              <TabsTrigger value="return">Return</TabsTrigger>
              <TabsTrigger value="handmade">Handmade</TabsTrigger>
            </TabsList>
            <TabsContent value="fabric" className="text-sm text-foreground/80 leading-relaxed pt-3">
              {p.fabric}. Hand wash in cold water with mild detergent. Do not bleach. Dry in shade. Iron on medium heat.
            </TabsContent>
            <TabsContent value="delivery" className="text-sm pt-3 space-y-2">
              <div>Inside Dhaka: 1-2 days · ৳60</div>
              <div>Outside Dhaka: 3-5 days · ৳120</div>
              <select className="mt-2 bg-card border border-border rounded-lg px-3 py-2 text-sm">
                <option>Estimate by district…</option>
                <option>Dhaka</option><option>Chattogram</option><option>Sylhet</option>
              </select>
            </TabsContent>
            <TabsContent value="return" className="text-sm pt-3">7-day return & exchange. Item must be unused with tags. See full policy.</TabsContent>
            <TabsContent value="handmade" className="text-sm pt-3">
              This piece was carefully hand-stitched by artisans in Bangladesh. Each kurti is crafted over days, not hours. Minor variation in stitch pattern is the signature of true handwork.
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="font-display text-3xl text-foreground">Pair it with</h2>
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {related.map((r) => <ProductCard key={r.id} p={r} />)}
        </div>
      </section>
    </div>
  );
}

function Feature({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="bg-cream rounded-lg p-3 text-center">
      <Icon className="h-4 w-4 text-maroon mx-auto" />
      <div className="mt-1 text-muted-foreground">{label}</div>
    </div>
  );
}

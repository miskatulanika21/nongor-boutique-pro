import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import type { Product } from "@/data/mock";
import { taka } from "@/lib/format";
import { useShop, quickAddToCart } from "@/store/shop";
import { toast } from "sonner";

export function ProductCard({ p }: { p: Product }) {
  const shop = useShop();
  const wished = shop.wishlist.includes(p.id);
  const price = p.discountPrice ?? p.price;
  const discount = p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl bg-card aspect-[4/5] shadow-soft">
        <Link to="/product/$slug" params={{ slug: p.slug }}>
          <img src={p.images[0]} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
        </Link>
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {p.isNew && <span className="bg-ivory text-maroon text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded">New</span>}
          {discount > 0 && <span className="bg-maroon text-primary-foreground text-[10px] uppercase tracking-wider font-semibold px-2 py-1 rounded">-{discount}%</span>}
          {p.stock <= 5 && p.stock > 0 && <span className="bg-gold text-gold-foreground text-[10px] font-semibold px-2 py-1 rounded">Only {p.stock} left</span>}
        </div>
        <button
          onClick={() => { shop.toggleWishlist(p.id); toast.success(wished ? "Removed from wishlist" : "Added to wishlist"); }}
          className={`absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-ivory/90 backdrop-blur-sm hover:bg-ivory transition ${wished ? "text-maroon" : "text-foreground/60"}`}
        >
          <Heart className={`h-4 w-4 ${wished ? "fill-current" : ""}`} />
        </button>
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
          <button
            onClick={() => { quickAddToCart(shop, p); toast.success("Added to bag"); }}
            className="flex-1 bg-maroon text-primary-foreground rounded-lg py-2.5 text-xs font-semibold tracking-wide flex items-center justify-center gap-1.5 hover:bg-maroon-deep transition"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
          </button>
          <Link to="/product/$slug" params={{ slug: p.slug }} className="h-10 w-10 grid place-items-center rounded-lg bg-ivory hover:bg-cream transition">
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>
      <div className="mt-4 px-1">
        <Link to="/product/$slug" params={{ slug: p.slug }}>
          <h3 className="text-sm md:text-base font-medium text-foreground/90 hover:text-maroon transition line-clamp-1">{p.name}</h3>
        </Link>
        <div className="mt-1.5 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg text-maroon font-semibold">{taka(price)}</span>
            {p.discountPrice && <span className="text-xs text-muted-foreground line-through">{taka(p.price)}</span>}
          </div>
          <div className="flex gap-1">
            {p.colors.slice(0, 3).map((c) => (
              <span key={c.name} className="h-3 w-3 rounded-full border border-border" style={{ background: c.hex }} title={c.name} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

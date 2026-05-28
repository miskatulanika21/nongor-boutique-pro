import { Link } from "@tanstack/react-router";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import type { Product } from "@/data/mock";
import { taka } from "@/lib/format";
import { useShop, quickAddToCart } from "@/store/shop";
import { isOutOfStock, isLowStock, getStock } from "@/lib/stock";
import { toast } from "sonner";

export function ProductCard({ p }: { p: Product }) {
  const shop = useShop();
  const wished = shop.wishlist.includes(p.id);
  const price = p.discountPrice ?? p.price;
  const discount = p.discountPrice ? Math.round(((p.price - p.discountPrice) / p.price) * 100) : 0;
  const outOfStock = isOutOfStock(p);
  const lowStock = isLowStock(p);
  return (
    <div className="group relative">
      <div className="relative overflow-hidden rounded-2xl bg-cream aspect-[4/5] shadow-soft ring-1 ring-hairline/60 transition-all duration-500 ease-soft group-hover:shadow-elegant group-hover:-translate-y-1">
        <Link to="/product/$slug" params={{ slug: p.slug }} className="block h-full">
          <img
            src={p.images[0]}
            alt={p.name}
            className="h-full w-full object-cover transition-transform duration-[900ms] ease-soft group-hover:scale-110"
            loading="lazy"
          />
          {/* image vignette */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </Link>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {p.isNew && (
            <span className="bg-ivory/95 backdrop-blur text-maroon text-[10px] uppercase tracking-[0.15em] font-semibold px-2.5 py-1 rounded-full border border-gold/40">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="bg-maroon text-primary-foreground text-[10px] uppercase tracking-[0.15em] font-semibold px-2.5 py-1 rounded-full shadow-soft">
              −{discount}%
            </span>
          )}
          {p.stock <= 5 && p.stock > 0 && (
            <span className="bg-gold/95 text-gold-foreground text-[10px] font-semibold px-2.5 py-1 rounded-full">
              Only {p.stock} left
            </span>
          )}
          {outOfStock && (
            <span className="bg-charcoal/90 text-primary-foreground text-[10px] uppercase tracking-[0.15em] font-semibold px-2.5 py-1 rounded-full">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={() => { shop.toggleWishlist(p.id); toast.success(wished ? "Removed from wishlist" : "Saved to wishlist"); }}
          className={`absolute top-3 right-3 h-9 w-9 grid place-items-center rounded-full bg-ivory/90 backdrop-blur-sm hover:bg-ivory hover:scale-110 transition-all duration-300 ease-soft shadow-soft ${
            wished ? "text-maroon" : "text-foreground/70"
          }`}
          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`h-[15px] w-[15px] transition ${wished ? "fill-current scale-110" : ""}`} />
        </button>

        {/* Quick actions */}
        <div className="absolute inset-x-3 bottom-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-3 group-hover:translate-y-0 transition-all duration-400 ease-soft">
          <button
            onClick={() => { if (!outOfStock) { quickAddToCart(shop, p); toast.success("Added to your bag"); } }}
            disabled={outOfStock}
            className="flex-1 btn-maroon rounded-full py-2.5 text-[11px] uppercase tracking-[0.15em] font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBag className="h-3.5 w-3.5" /> Add to Bag
          </button>
          <Link
            to="/product/$slug"
            params={{ slug: p.slug }}
            className="h-10 w-10 grid place-items-center rounded-full bg-ivory hover:bg-cream transition shadow-soft"
            aria-label="Quick view"
          >
            <Eye className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Meta */}
      <div className="mt-4 px-1">
        <Link to="/product/$slug" params={{ slug: p.slug }}>
          <h3 className="font-display text-[15px] md:text-base text-foreground/90 leading-snug hover:text-maroon transition line-clamp-1">
            {p.name}
          </h3>
        </Link>
        {p.fabric && (
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">{p.fabric}</div>
        )}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="font-display text-lg text-maroon font-semibold tracking-tight">{taka(price)}</span>
            {p.discountPrice && (
              <span className="text-[11px] text-muted-foreground line-through">{taka(p.price)}</span>
            )}
          </div>
          <div className="flex gap-1">
            {p.colors.slice(0, 4).map((c) => (
              <span
                key={c.name}
                className="h-3 w-3 rounded-full ring-1 ring-inset ring-hairline"
                style={{ background: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

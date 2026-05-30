import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop, getProductStock } from "@/store/shop";
import { taka } from "@/lib/format";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag, Heart, Truck, ShieldCheck, Tag, AlertTriangle, Gift } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shop/cart")({
  head: () => ({ meta: [{ title: "Your Bag — Nongor" }] }),
  component: Cart,
});

const FREE_DELIVERY_THRESHOLD = 2500;
const COUPONS: Record<string, { label: string; apply: (subtotal: number) => number }> = {
  NONGOR10: { label: "10% off", apply: (s) => Math.round(s * 0.1) },
  FESTIVE500: { label: "৳500 off", apply: () => 500 },
  WELCOME15: { label: "15% off", apply: (s) => Math.round(s * 0.15) },
};

function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal, toggleWishlist, wishlist } = useShop();
  const [coupon, setCoupon] = useState("");
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [discount, setDiscount] = useState(0);
  const [giftOpen, setGiftOpen] = useState(false);
  const [giftNote, setGiftNote] = useState("");

  const delivery = cartTotal >= FREE_DELIVERY_THRESHOLD ? 0 : 80;
  const total = Math.max(0, cartTotal - discount + delivery);
  const remaining = Math.max(0, FREE_DELIVERY_THRESHOLD - cartTotal);
  const progress = Math.min(100, (cartTotal / FREE_DELIVERY_THRESHOLD) * 100);

  const apply = () => {
    const code = coupon.trim().toUpperCase();
    const found = COUPONS[code];
    if (!found) {
      setDiscount(0);
      setAppliedCode(null);
      toast.error("Coupon not recognised");
      return;
    }
    const value = found.apply(cartTotal);
    setDiscount(value);
    setAppliedCode(code);
    toast.success(`${found.label} applied`);
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCode(null);
    setCoupon("");
  };

  const saveForLater = (i: number, productId: string) => {
    if (!wishlist.includes(productId)) toggleWishlist(productId);
    removeFromCart(i);
    toast.success("Saved to your wishlist");
  };

  if (cart.length === 0) {
    return (
      <div className="container-narrow py-20 text-center">
        <div className="h-24 w-24 mx-auto rounded-full bg-cream grid place-items-center"><ShoppingBag className="h-10 w-10 text-maroon" /></div>
        <h1 className="mt-6 font-display text-4xl">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">Discover handmade pieces to call your own.</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/shop" className="inline-flex items-center gap-2 bg-maroon hover:bg-maroon-deep text-primary-foreground px-7 py-3 rounded-full text-sm font-semibold transition shadow-elegant">
            Shop Collection <ArrowRight className="h-4 w-4" />
          </Link>
          <Link to="/wishlist" className="inline-flex items-center gap-2 border border-maroon/40 text-maroon hover:border-maroon px-7 py-3 rounded-full text-sm font-semibold transition">
            View wishlist
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-narrow py-8 md:py-12 pb-32 lg:pb-12">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl md:text-5xl">Your Bag</h1>
          <p className="text-muted-foreground text-sm mt-1">{cart.length} item{cart.length > 1 && "s"} · ready to ship</p>
        </div>
        <Link to="/shop" className="hidden sm:inline-flex items-center gap-1 text-sm text-maroon font-medium hover:underline">← Continue shopping</Link>
      </div>

      <div className="mt-4 bg-cream rounded-2xl p-4">
        <div className="flex items-center gap-2 text-xs md:text-sm">
          <Truck className="h-4 w-4 text-maroon shrink-0" />
          {remaining > 0 ? (
            <span>Add <span className="font-semibold text-maroon">{taka(remaining)}</span> more for <span className="font-semibold">free delivery</span>.</span>
          ) : (
            <span className="text-maroon font-semibold">You’ve unlocked free delivery 🎉</span>
          )}
        </div>
        <div className="mt-2 h-1.5 bg-ivory rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-gold to-maroon rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-4">
          {cart.map((it, i) => {
            const maxStock = getProductStock(it.productId, it.size, it.color);
            const isAtMax = it.qty >= maxStock;
            const lowStock = maxStock > 0 && maxStock <= 3;
            return (
              <div key={i} className="group bg-card rounded-2xl p-4 shadow-soft flex gap-4 transition hover:shadow-elegant">
                <Link to="/product/$slug" params={{ slug: it.slug }} className="shrink-0">
                  <img src={it.image} alt={it.name} className="h-28 w-24 md:h-36 md:w-28 object-cover rounded-xl" />
                </Link>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link to="/product/$slug" params={{ slug: it.slug }} className="font-display text-base md:text-lg hover:text-maroon block truncate">{it.name}</Link>
                      <div className="text-xs text-muted-foreground mt-1">Size {it.size} · {it.color}</div>
                    </div>
                    <button onClick={() => removeFromCart(i)} className="text-muted-foreground hover:text-destructive transition shrink-0 p-1" aria-label="Remove">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {lowStock && (
                    <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full self-start">
                      <AlertTriangle className="h-3 w-3" /> Only {maxStock} left
                    </div>
                  )}

                  <div className="mt-auto pt-3 flex items-end justify-between gap-2">
                    <div className="flex items-center border border-border rounded-full">
                      <button onClick={() => updateQty(i, it.qty - 1)} className="h-9 w-9 grid place-items-center hover:text-maroon transition"><Minus className="h-3.5 w-3.5" /></button>
                      <span className="w-7 text-center text-sm font-medium tabular-nums">{it.qty}</span>
                      <button
                        onClick={() => updateQty(i, it.qty + 1)}
                        disabled={isAtMax}
                        className={`h-9 w-9 grid place-items-center transition ${isAtMax ? "opacity-30 cursor-not-allowed" : "hover:text-maroon"}`}
                        title={isAtMax ? "Maximum stock reached" : "Increase quantity"}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-display text-lg md:text-xl text-maroon leading-none">{taka(it.price * it.qty)}</div>
                      {it.qty > 1 && <div className="text-[11px] text-muted-foreground mt-0.5">{taka(it.price)} each</div>}
                    </div>
                  </div>

                  <button
                    onClick={() => saveForLater(i, it.productId)}
                    className="mt-3 self-start inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-maroon transition"
                  >
                    <Heart className="h-3.5 w-3.5" /> Save for later
                  </button>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => setGiftOpen((o) => !o)}
            className="w-full bg-card rounded-2xl p-4 shadow-soft text-left flex items-center gap-3 hover:shadow-elegant transition"
          >
            <div className="h-10 w-10 rounded-full bg-cream grid place-items-center text-maroon"><Gift className="h-4 w-4" /></div>
            <div className="flex-1">
              <div className="text-sm font-medium">Sending this as a gift?</div>
              <div className="text-xs text-muted-foreground">Add a handwritten note — wrapped in our signature ivory paper.</div>
            </div>
            <span className="text-xs text-maroon font-medium">{giftOpen ? "Hide" : giftNote ? "Edit" : "Add note"}</span>
          </button>
          {giftOpen && (
            <textarea
              value={giftNote}
              onChange={(e) => setGiftNote(e.target.value.slice(0, 200))}
              rows={3}
              placeholder="Write a short message (max 200 characters)"
              className="w-full px-4 py-3 rounded-2xl bg-card shadow-soft text-sm outline-none border border-transparent focus:border-maroon resize-none"
            />
          )}

          <Link to="/shop" className="sm:hidden inline-flex items-center gap-1 text-sm text-maroon font-medium">← Continue shopping</Link>
        </div>

        <div className="lg:sticky lg:top-24 h-fit space-y-4">
          <div className="bg-card rounded-2xl p-6 shadow-soft">
            <h3 className="font-display text-xl">Order Summary</h3>

            <div className="mt-4">
              {appliedCode ? (
                <div className="flex items-center justify-between bg-cream rounded-lg px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="h-4 w-4 text-maroon" />
                    <span className="font-semibold text-maroon">{appliedCode}</span>
                    <span className="text-xs text-muted-foreground">applied</span>
                  </div>
                  <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") apply(); }}
                    placeholder="Coupon code"
                    className="flex-1 px-4 py-2.5 rounded-lg bg-secondary text-sm outline-none border border-transparent focus:border-maroon uppercase tracking-wide"
                  />
                  <button onClick={apply} className="bg-maroon hover:bg-maroon-deep text-primary-foreground px-5 rounded-lg text-sm font-semibold transition">Apply</button>
                </div>
              )}
              <div className="mt-2 text-[11px] text-muted-foreground">Try <button onClick={() => setCoupon("NONGOR10")} className="text-maroon hover:underline">NONGOR10</button> or <button onClick={() => setCoupon("FESTIVE500")} className="text-maroon hover:underline">FESTIVE500</button></div>
            </div>

            <div className="mt-5 space-y-2 text-sm border-t border-border pt-5">
              <Row label="Subtotal" value={taka(cartTotal)} />
              {discount > 0 && <Row label="Discount" value={`-${taka(discount)}`} good />}
              <Row label="Delivery" value={delivery === 0 ? "Free" : taka(delivery)} />
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
              <div>
                <div className="font-display text-lg">Total</div>
                <div className="text-[11px] text-muted-foreground">VAT included</div>
              </div>
              <span className="font-display text-2xl text-maroon">{taka(total)}</span>
            </div>
            <Link to="/checkout" className="mt-6 w-full bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-full py-3.5 font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition shadow-elegant">
              Proceed to Checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-[11px] text-center text-muted-foreground">Secure checkout · Cash on Delivery available</p>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-2 text-[11px]">
            <TrustChip icon={ShieldCheck} label="Quality assured" />
            <TrustChip icon={Truck} label="2–5 day delivery" />
          </div>
        </div>
      </div>

      {/* Mobile sticky checkout bar */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-40 bg-card/95 backdrop-blur border-t border-border px-4 py-3 shadow-elegant">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] text-muted-foreground">Total</div>
            <div className="font-display text-xl text-maroon leading-none">{taka(total)}</div>
          </div>
          <Link to="/checkout" className="flex-1 max-w-[220px] bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-full py-3 font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition shadow-elegant">
            Checkout <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className={good ? "text-green-700 font-medium" : "font-medium"}>{value}</span></div>;
}

function TrustChip({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="bg-cream rounded-xl p-3 flex items-center gap-2 text-muted-foreground">
      <Icon className="h-3.5 w-3.5 text-maroon" /> {label}
    </div>
  );
}

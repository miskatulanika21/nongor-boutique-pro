import { createFileRoute, Link } from "@tanstack/react-router";
import { useShop } from "@/store/shop";
import { taka } from "@/lib/format";
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shop/cart")({
  head: () => ({ meta: [{ title: "Your Bag — Nongor" }] }),
  component: Cart,
});

function Cart() {
  const { cart, updateQty, removeFromCart, cartTotal } = useShop();
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const delivery = cartTotal > 2500 ? 0 : 80;
  const total = cartTotal - discount + delivery;

  const apply = () => {
    if (coupon.toUpperCase() === "NONGOR10") { setDiscount(Math.round(cartTotal * 0.1)); toast.success("10% off applied"); }
    else if (coupon.toUpperCase() === "FESTIVE500") { setDiscount(500); toast.success("৳500 off applied"); }
    else { setDiscount(0); toast.error("Invalid coupon"); }
  };

  if (cart.length === 0) {
    return (
      <div className="container-narrow py-20 text-center">
        <div className="h-24 w-24 mx-auto rounded-full bg-cream grid place-items-center"><ShoppingBag className="h-10 w-10 text-maroon" /></div>
        <h1 className="mt-6 font-display text-4xl">Your bag is empty</h1>
        <p className="mt-2 text-muted-foreground">Discover handmade pieces to call your own.</p>
        <Link to="/shop" className="mt-6 inline-flex items-center gap-2 bg-maroon text-primary-foreground px-7 py-3 rounded-full text-sm font-semibold">Shop Collection <ArrowRight className="h-4 w-4" /></Link>
      </div>
    );
  }

  return (
    <div className="container-narrow py-10">
      <h1 className="font-display text-3xl md:text-5xl">Your Bag</h1>
      <p className="text-muted-foreground text-sm mt-1">{cart.length} item{cart.length > 1 && "s"}</p>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-4">
          {cart.map((it, i) => (
            <div key={i} className="bg-card rounded-2xl p-4 shadow-soft flex gap-4">
              <img src={it.image} alt={it.name} className="h-28 w-24 md:h-36 md:w-28 object-cover rounded-xl" />
              <div className="flex-1">
                <Link to="/product/$slug" params={{ slug: it.slug }} className="font-display text-base md:text-lg hover:text-maroon">{it.name}</Link>
                <div className="text-xs text-muted-foreground mt-1">Size: {it.size} · Color: {it.color}</div>
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center border border-border rounded-full">
                    <button onClick={() => updateQty(i, it.qty - 1)} className="h-8 w-8 grid place-items-center"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm">{it.qty}</span>
                    <button onClick={() => updateQty(i, it.qty + 1)} className="h-8 w-8 grid place-items-center"><Plus className="h-3 w-3" /></button>
                  </div>
                  <div className="font-display text-lg text-maroon">{taka(it.price * it.qty)}</div>
                </div>
              </div>
              <button onClick={() => removeFromCart(i)} className="self-start text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
          <Link to="/shop" className="inline-flex items-center gap-1 text-sm text-maroon font-medium">← Continue shopping</Link>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft h-fit lg:sticky lg:top-24">
          <h3 className="font-display text-xl">Order Summary</h3>
          <div className="mt-4 flex gap-2">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder="Coupon code" className="flex-1 px-4 py-2.5 rounded-lg bg-secondary text-sm outline-none border border-transparent focus:border-maroon" />
            <button onClick={apply} className="bg-maroon text-primary-foreground px-5 rounded-lg text-sm font-semibold">Apply</button>
          </div>
          <div className="mt-5 space-y-2 text-sm border-t border-border pt-5">
            <Row label="Subtotal" value={taka(cartTotal)} />
            {discount > 0 && <Row label="Discount" value={`-${taka(discount)}`} good />}
            <Row label="Delivery" value={delivery === 0 ? "Free" : taka(delivery)} />
          </div>
          <div className="mt-4 pt-4 border-t border-border flex items-baseline justify-between">
            <span className="font-display text-lg">Total</span>
            <span className="font-display text-2xl text-maroon">{taka(total)}</span>
          </div>
          <Link to="/checkout" className="mt-6 w-full bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-full py-3.5 font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition shadow-elegant">
            Proceed to Checkout <ArrowRight className="h-4 w-4" />
          </Link>
          <p className="mt-3 text-[11px] text-center text-muted-foreground">Secure checkout · Cash on Delivery available</p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return <div className="flex justify-between"><span className="text-muted-foreground">{label}</span><span className={good ? "text-green-700 font-medium" : ""}>{value}</span></div>;
}

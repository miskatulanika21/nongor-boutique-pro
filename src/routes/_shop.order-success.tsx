import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/_shop/order-success")({
  head: () => ({ meta: [{ title: "Order Confirmed — Nongor" }] }),
  component: Success,
});

function Success() {
  const orderId = "NGR-" + Math.floor(1000 + Math.random() * 9000);
  return (
    <div className="container-narrow py-16 max-w-2xl">
      <div className="text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-green-100 grid place-items-center">
          <CheckCircle2 className="h-10 w-10 text-green-700" />
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl text-maroon">Order Confirmed</h1>
        <p className="mt-3 text-muted-foreground">Thank you — your handmade piece is being prepared with care.</p>
      </div>

      <div className="mt-10 bg-card rounded-2xl p-6 md:p-8 shadow-soft">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><div className="text-xs text-muted-foreground">Order ID</div><div className="font-display text-lg text-maroon">{orderId}</div></div>
          <div><div className="text-xs text-muted-foreground">Payment</div><div className="font-medium">Pending verification</div></div>
          <div><div className="text-xs text-muted-foreground">Delivery</div><div className="font-medium">3-5 business days</div></div>
        </div>
        <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
          <Package className="h-5 w-5 text-gold" />
          <div className="text-sm">We'll send you SMS updates on <span className="font-semibold">01XXXXXXXXX</span></div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/track-order" className="bg-maroon text-primary-foreground rounded-full px-7 py-3 text-sm font-semibold text-center">Track Order</Link>
        <Link to="/shop" className="border border-border rounded-full px-7 py-3 text-sm font-semibold text-center inline-flex items-center justify-center gap-1">Continue Shopping <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}

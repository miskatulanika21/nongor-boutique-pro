import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Phone, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/_shop/track-order")({
  head: () => ({ meta: [{ title: "Track Order — Nongor" }] }),
  component: Track,
});

const stages = ["Order Placed", "Confirmed", "Processing", "Packed", "Shipped", "Delivered"];

function Track() {
  const [show, setShow] = useState(false);
  const current = 4;

  return (
    <div className="container-narrow py-12 max-w-3xl">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-gold">Order Tracking</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Where's my order?</h1>
        <p className="mt-2 text-muted-foreground">Enter your order ID and phone to see live status.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setShow(true); }} className="mt-8 bg-card rounded-2xl p-6 shadow-soft grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <input placeholder="Order ID (e.g. NGR-1042)" defaultValue="NGR-1040" className="px-4 py-3 rounded-lg bg-secondary text-sm outline-none" />
        <input placeholder="Phone number" defaultValue="01911-998877" className="px-4 py-3 rounded-lg bg-secondary text-sm outline-none" />
        <button className="bg-maroon text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold">Track</button>
      </form>

      {show && (
        <>
          <div className="mt-8 bg-card rounded-2xl p-6 md:p-8 shadow-soft">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Order</div>
                <div className="font-display text-2xl text-maroon">NGR-1040</div>
              </div>
              <span className="px-3 py-1 bg-cream text-maroon text-xs font-semibold rounded-full">Shipped</span>
            </div>

            <div className="mt-8 relative">
              <div className="absolute top-4 left-0 right-0 h-0.5 bg-border" />
              <div className="absolute top-4 left-0 h-0.5 bg-maroon transition-all" style={{ width: `${(current / (stages.length - 1)) * 100}%` }} />
              <div className="relative flex justify-between">
                {stages.map((s, i) => (
                  <div key={s} className="flex flex-col items-center text-center">
                    <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold ${i <= current ? "bg-maroon text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{i + 1}</div>
                    <div className={`mt-2 text-[10px] md:text-xs max-w-[60px] ${i <= current ? "text-foreground font-medium" : "text-muted-foreground"}`}>{s}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-2 text-maroon"><Package className="h-4 w-4" /><span className="font-semibold text-sm">Courier</span></div>
              <div className="mt-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Partner</span><span>Pathao Courier</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tracking ID</span><span className="font-mono">PT-44120</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">ETA</span><span>Tomorrow</span></div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-soft">
              <div className="flex items-center gap-2 text-maroon"><MessageCircle className="h-4 w-4" /><span className="font-semibold text-sm">Need help?</span></div>
              <p className="mt-2 text-sm text-muted-foreground">Our team responds within 1 hour during business hours.</p>
              <a href="tel:01700000000" className="mt-3 inline-flex items-center gap-2 text-sm text-maroon font-semibold"><Phone className="h-4 w-4" /> +880 1700-000000</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Package, Phone, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useAdmin } from "@/store/admin";
import { taka } from "@/lib/format";
import { toast } from "sonner";
import { trackOrder } from "@/services/orders";

export const Route = createFileRoute("/_shop/track-order")({
  head: () => ({ meta: [{ title: "Track Order — Nongor" }] }),
  component: Track,
});

const stages = ["Order Placed", "Confirmed", "Processing", "Packed", "Shipped", "Delivered"];

function getStageIndex(status: string): number {
  switch (status) {
    case "Pending": return 0;
    case "Confirmed": return 1;
    case "Processing": return 2;
    case "Packed": return 3;
    case "Shipped": return 4;
    case "Delivered": return 5;
    case "Cancelled": return -1;
    default: return 0;
  }
}

function Track() {
  const { orders } = useAdmin();
  const [orderId, setOrderId] = useState("NGR-1040"); // mock defaults
  const [phone, setPhone] = useState("01911-998877");
  const [trackedOrder, setTrackedOrder] = useState<any>(null);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setTrackedOrder(null);
    setHasSearched(true);

    if (!orderId.trim()) {
      setError("Please enter your Order ID.");
      return;
    }
    if (!phone.trim()) {
      setError("Please enter your Phone number.");
      return;
    }

    setLoading(true);
    try {
      const res = await trackOrder(orderId.trim(), phone.trim());
      if (res.found && res.order) {
        const o = res.order;
        setTrackedOrder({
          id: o.order_number,
          customer: o.customer_name,
          phone: phone.trim(),
          status: o.order_status === "pending" ? "Pending" : o.order_status === "confirmed" ? "Confirmed" : o.order_status === "processing" ? "Processing" : o.order_status === "packed" ? "Packed" : o.order_status === "shipped" ? "Shipped" : o.order_status === "delivered" ? "Delivered" : o.order_status === "cancelled" ? "Cancelled" : o.order_status,
          courier: o.courier_name,
          trackingId: o.tracking_id,
          total: o.total_amount,
        });
        toast.success("Order status retrieved successfully!");
        setLoading(false);
        return;
      }

      // Offline / Local Mock Fallback
      const cleanPhoneInput = phone.replace(/[-\s]/g, "");
      const match = orders.find(
        (o) =>
          o.id.toLowerCase().trim() === orderId.toLowerCase().trim() &&
          o.phone.replace(/[-\s]/g, "") === cleanPhoneInput
      );

      if (match) {
        setTrackedOrder(match);
        toast.success("Order status retrieved (Offline Mode)!");
      } else {
        setError("No matching order was found with that ID and phone number combination.");
        toast.error("Order not found");
      }
    } catch (err) {
      console.error("[track-order] error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const currentStage = trackedOrder ? getStageIndex(trackedOrder.status) : -1;

  return (
    <div className="container-narrow py-12 max-w-3xl">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">Order Tracking</div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Where's my order?</h1>
        <p className="mt-2 text-muted-foreground text-sm">Enter your order ID and phone number to see live status.</p>
      </div>

      <form onSubmit={handleTrack} className="mt-8 bg-card rounded-2xl p-6 shadow-soft grid sm:grid-cols-[1fr_1fr_auto] gap-3 border border-border/40">
        <input
          placeholder="Order ID (e.g. NGR-1042)"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="px-4 py-3 rounded-lg bg-secondary text-sm outline-none border border-transparent focus:border-maroon transition font-mono uppercase"
        />
        <input
          placeholder="Phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="px-4 py-3 rounded-lg bg-secondary text-sm outline-none border border-transparent focus:border-maroon transition"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold cursor-pointer transition shadow-soft flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Track Order
        </button>
      </form>

      {error && hasSearched && (
        <div className="mt-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm text-center flex items-center justify-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {trackedOrder && !error && (
        <>
          <div className="mt-8 bg-card rounded-2xl p-6 md:p-8 shadow-soft border border-border/40 animate-fade-up">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-border/40 pb-4">
              <div>
                <div className="text-xs text-muted-foreground">Order ID</div>
                <div className="font-display text-2xl text-maroon font-bold font-mono">{trackedOrder.id}</div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Status</div>
                <span className="px-3 py-1 bg-cream text-maroon text-xs font-semibold rounded-full border border-gold/25">
                  {trackedOrder.status}
                </span>
              </div>
            </div>

            {trackedOrder.status === "Cancelled" ? (
              <div className="mt-8 bg-red-50 border border-red-200 rounded-xl p-5 text-center text-sm text-red-800 font-semibold flex items-center justify-center gap-2">
                <AlertTriangle className="h-5 w-5 shrink-0" /> This order has been Cancelled. Please contact support.
              </div>
            ) : (
              <div className="mt-8 relative">
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-border/60" />
                <div
                  className="absolute top-4 left-0 h-0.5 bg-maroon transition-all duration-700"
                  style={{ width: `${(Math.max(0, currentStage) / (stages.length - 1)) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {stages.map((s, i) => (
                    <div key={s} className="flex flex-col items-center text-center">
                      <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold border transition ${
                        i <= currentStage ? "bg-maroon text-primary-foreground border-maroon shadow-soft" : "bg-secondary text-muted-foreground border-border"
                      }`}>
                        {i + 1}
                      </div>
                      <div className={`mt-2 text-[10px] md:text-xs max-w-[64px] font-medium leading-tight ${
                        i <= currentStage ? "text-foreground font-semibold" : "text-muted-foreground"
                      }`}>
                        {s}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4 animate-fade-up">
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/40">
              <div className="flex items-center gap-2 text-maroon font-semibold"><Package className="h-4 w-4" /><span className="text-sm font-semibold">Delivery details</span></div>
              <div className="mt-3 text-sm space-y-1.5 leading-relaxed">
                <div className="flex justify-between"><span className="text-muted-foreground">Customer</span><span className="font-medium">{trackedOrder.customer}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Courier Partner</span><span>{trackedOrder.courier || "Pending Dispatch"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tracking ID</span><span className="font-mono">{trackedOrder.trackingId || "N/A"}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total Price</span><span className="font-semibold text-maroon">{taka(trackedOrder.total)}</span></div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/40">
              <div className="flex items-center gap-2 text-maroon font-semibold"><MessageCircle className="h-4 w-4" /><span className="text-sm font-semibold">Need assistance?</span></div>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">Our support desk is standing by to help with any shipping or delivery adjustments.</p>
              <a href="tel:01700000000" className="mt-3.5 inline-flex items-center gap-2 text-sm text-maroon font-semibold hover:underline"><Phone className="h-4 w-4" /> +880 1700-000000</a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

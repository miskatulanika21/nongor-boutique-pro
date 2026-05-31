import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Package, Phone, MessageCircle, AlertTriangle, Loader2 } from "lucide-react";
import { taka } from "@/lib/format";
import { toast } from "sonner";
import { trackOrder } from "@/services/orders";
import { trackOrderSchema, normalizePhone } from "@/lib/validation";

type TrackSearch = { orderId?: string; phone?: string };

export const Route = createFileRoute("/_shop/track-order")({
  validateSearch: (search: Record<string, unknown>): TrackSearch => ({
    orderId: typeof search.orderId === "string" ? search.orderId : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  head: () => ({ meta: [{ title: "Track Order — Nongor" }] }),
  component: Track,
});

const stages = ["Order Placed", "Confirmed", "Processing", "Packed", "Shipped", "Delivered"];

function getStageIndex(status: string): number {
  switch (status) {
    case "Pending":
    case "pending":
      return 0;
    case "Confirmed":
    case "confirmed":
      return 1;
    case "Processing":
    case "processing":
      return 2;
    case "Packed":
    case "packed":
      return 3;
    case "Shipped":
    case "shipped":
      return 4;
    case "Delivered":
    case "delivered":
      return 5;
    case "Cancelled":
    case "cancelled":
      return -1;
    default:
      return 0;
  }
}

type TrackedOrder = {
  id: string;
  customer: string;
  phone: string;
  status: string;
  courier?: string | null;
  trackingId?: string | null;
  total: number;
};

function Track() {
  const searchParams = Route.useSearch();
  const [orderId, setOrderId] = useState(searchParams.orderId ?? "");
  const [phone, setPhone] = useState(searchParams.phone ?? "");
  const [trackedOrder, setTrackedOrder] = useState<TrackedOrder | null>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrackDirect = useCallback(async (id: string, ph: string) => {
    setError("");
    setFieldErrors({});
    setTrackedOrder(null);
    setHasSearched(true);
    setLoading(true);

    try {
      const res = await trackOrder(id.trim(), normalizePhone(ph));
      if (res.found && res.order) {
        const o = res.order as Record<string, unknown>;
        setTrackedOrder({
          id: (o.order_number as string) ?? id,
          customer: (o.customer_name as string) ?? "Customer",
          phone: ph,
          status: capitalize((o.order_status as string) ?? "pending"),
          courier: o.courier_name as string | undefined,
          trackingId: o.tracking_id as string | undefined,
          total: (o.total_amount as number) ?? 0,
        });
        toast.success("Order status retrieved!");
      } else {
        setError("No matching order found with that order number and phone number.");
        toast.error("Order not found");
      }
    } catch (err) {
      console.error("[track-order] error:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-search if params provided
  useEffect(() => {
    if (searchParams.orderId && searchParams.phone) {
      handleTrackDirect(searchParams.orderId, searchParams.phone);
    }
  }, [searchParams.orderId, searchParams.phone, handleTrackDirect]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    const result = trackOrderSchema.safeParse({ orderId, phone });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => {
        const key = i.path[0] as string;
        if (!errs[key]) errs[key] = i.message;
      });
      setFieldErrors(errs);
      return;
    }

    await handleTrackDirect(result.data.orderId, result.data.phone);
  };

  const currentStage = trackedOrder ? getStageIndex(trackedOrder.status) : -1;

  return (
    <div className="container-narrow py-12 max-w-3xl">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-gold font-semibold">
          Order Tracking
        </div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl">Where's my order?</h1>
        <p className="mt-2 text-muted-foreground text-sm">
          Enter your order number and phone to see live status.
        </p>
      </div>

      <form
        onSubmit={handleTrack}
        className="mt-8 bg-card rounded-2xl p-6 shadow-soft border border-border/40"
      >
        <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-3">
          <div>
            <input
              placeholder="Order number (e.g. NGR-000001)"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-secondary text-sm outline-none border transition font-mono uppercase ${
                fieldErrors.orderId
                  ? "border-rose-400 bg-rose-50/50"
                  : "border-transparent focus:border-maroon"
              }`}
            />
            {fieldErrors.orderId && (
              <p className="mt-1 text-[11px] text-rose-700 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {fieldErrors.orderId}
              </p>
            )}
          </div>
          <div>
            <input
              placeholder="Phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`w-full px-4 py-3 rounded-lg bg-secondary text-sm outline-none border transition ${
                fieldErrors.phone
                  ? "border-rose-400 bg-rose-50/50"
                  : "border-transparent focus:border-maroon"
              }`}
            />
            {fieldErrors.phone && (
              <p className="mt-1 text-[11px] text-rose-700 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" /> {fieldErrors.phone}
              </p>
            )}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold cursor-pointer transition shadow-soft flex items-center justify-center gap-2 disabled:opacity-50 h-fit self-start"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Track Order
          </button>
        </div>
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
                <div className="text-xs text-muted-foreground">Order Number</div>
                <div className="font-display text-2xl text-maroon font-bold font-mono">
                  {trackedOrder.id}
                </div>
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
                <AlertTriangle className="h-5 w-5 shrink-0" /> This order has been Cancelled. Please
                contact support.
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
                      <div
                        className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold border transition ${
                          i <= currentStage
                            ? "bg-maroon text-primary-foreground border-maroon shadow-soft"
                            : "bg-secondary text-muted-foreground border-border"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <div
                        className={`mt-2 text-[10px] md:text-xs max-w-[64px] font-medium leading-tight ${
                          i <= currentStage
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground"
                        }`}
                      >
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
              <div className="flex items-center gap-2 text-maroon font-semibold">
                <Package className="h-4 w-4" />
                <span className="text-sm font-semibold">Delivery details</span>
              </div>
              <div className="mt-3 text-sm space-y-1.5 leading-relaxed">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{trackedOrder.customer}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Courier Partner</span>
                  <span>{trackedOrder.courier || "Pending Dispatch"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tracking ID</span>
                  <span className="font-mono">{trackedOrder.trackingId || "N/A"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Price</span>
                  <span className="font-semibold text-maroon">{taka(trackedOrder.total)}</span>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/40">
              <div className="flex items-center gap-2 text-maroon font-semibold">
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-semibold">Need assistance?</span>
              </div>
              <p className="mt-2 text-xs md:text-sm text-muted-foreground leading-relaxed">
                Our support desk is standing by to help with any shipping or delivery adjustments.
              </p>
              <a
                href="tel:01700000000"
                className="mt-3.5 inline-flex items-center gap-2 text-sm text-maroon font-semibold hover:underline"
              >
                <Phone className="h-4 w-4" /> +880 1700-000000
              </a>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

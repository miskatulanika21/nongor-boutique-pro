import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react";
import { useAdmin } from "@/store/admin";
import { taka } from "@/lib/format";
import { useState, useEffect } from "react";
import { trackOrder } from "@/services/orders";

type SuccessSearch = { orderId?: string; phone?: string };

export const Route = createFileRoute("/_shop/order-success")({
  validateSearch: (search: Record<string, unknown>): SuccessSearch => ({
    orderId: typeof search.orderId === "string" ? search.orderId : undefined,
    phone: typeof search.phone === "string" ? search.phone : undefined,
  }),
  head: () => ({ meta: [{ title: "Order Confirmed — Nongor" }] }),
  component: Success,
});

function Success() {
  const { orderId, phone } = Route.useSearch();
  const { orders } = useAdmin();
  const [dbOrder, setDbOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const localOrder = orderId ? orders.find((o) => o.id === orderId) : undefined;

  useEffect(() => {
    if (localOrder || !orderId || !phone) return;

    setLoading(true);
    trackOrder(orderId, phone)
      .then((res) => {
        if (res.found && res.order) {
          setDbOrder(res.order);
        }
      })
      .catch((err) => console.error("[order-success] trackOrder error:", err))
      .finally(() => setLoading(false));
  }, [orderId, phone, localOrder]);

  const order = localOrder || (dbOrder ? {
    id: dbOrder.order_number,
    customer: dbOrder.customer_name,
    phone: phone,
    district: dbOrder.district || "Dhaka",
    date: dbOrder.created_at ? dbOrder.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    items: 0,
    total: dbOrder.total_amount,
    payment: dbOrder.payment_method?.toUpperCase(),
    paymentStatus: dbOrder.payment_status === "verification_needed" ? "Verification Needed" : dbOrder.payment_status === "paid" ? "Paid" : "Pending",
    status: dbOrder.order_status,
  } : undefined);

  return (
    <div className="container-narrow py-16 max-w-2xl">
      <div className="text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-green-100 grid place-items-center">
          <CheckCircle2 className="h-10 w-10 text-green-700" />
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl text-maroon">Order Confirmed</h1>
        <p className="mt-3 text-muted-foreground">Thank you — your handmade piece is being prepared with care.</p>
      </div>

      <div className="mt-10 bg-card rounded-2xl p-6 md:p-8 shadow-soft relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] grid place-items-center z-10">
            <Loader2 className="h-8 w-8 text-maroon animate-spin" />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><div className="text-xs text-muted-foreground">Order ID</div><div className="font-display text-lg text-maroon">{order?.id ?? orderId ?? "—"}</div></div>
          <div><div className="text-xs text-muted-foreground">Payment</div><div className="font-medium">{order ? `${order.payment} · ${order.paymentStatus}` : "Pending verification"}</div></div>
          <div><div className="text-xs text-muted-foreground">Delivery</div><div className="font-medium">3–5 business days</div></div>
        </div>
        {order && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div><div className="text-xs text-muted-foreground">Customer</div><div className="font-medium">{order.customer}</div></div>
            <div><div className="text-xs text-muted-foreground">Phone</div><div className="font-medium">{order.phone}</div></div>
            <div><div className="text-xs text-muted-foreground">Total</div><div className="font-display text-lg text-maroon font-semibold">{taka(order.total)}</div></div>
          </div>
        )}
        <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
          <Package className="h-5 w-5 text-gold" />
          <div className="text-sm">We'll send you SMS updates on <span className="font-semibold">{order?.phone ?? "your phone"}</span></div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/track-order" className="bg-maroon text-primary-foreground rounded-full px-7 py-3 text-sm font-semibold text-center">Track Order</Link>
        <Link to="/shop" className="border border-border rounded-full px-7 py-3 text-sm font-semibold text-center inline-flex items-center justify-center gap-1">Continue Shopping <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  );
}

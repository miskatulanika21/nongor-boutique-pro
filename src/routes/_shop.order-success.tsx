import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Package, ArrowRight, Loader2 } from "lucide-react";
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

type OrderState = {
  orderNumber: string;
  customer: string;
  phone: string;
  total: number;
  payment: string;
  paymentStatus: string;
  status: string;
  date: string;
};

function Success() {
  const { orderId, phone } = Route.useSearch();
  const [order, setOrder] = useState<OrderState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!orderId || !phone) {
      setLoading(false);
      return;
    }

    trackOrder(orderId, phone)
      .then((res) => {
        if (res.found && res.order) {
          const o = res.order as Record<string, unknown>;
          setOrder({
            orderNumber: (o.order_number as string) ?? orderId,
            customer: (o.customer_name as string) ?? "Customer",
            phone: phone,
            total: (o.total_amount as number) ?? 0,
            payment: ((o.payment_method as string) ?? "COD").toUpperCase(),
            paymentStatus:
              o.payment_status === "verification_needed"
                ? "Verification Needed"
                : o.payment_status === "paid"
                  ? "Paid"
                  : "Pending",
            status: (o.order_status as string) ?? "pending",
            date: o.created_at
              ? new Date(o.created_at as string).toLocaleDateString("en-BD")
              : new Date().toLocaleDateString("en-BD"),
          });
        }
      })
      .catch((err) => console.error("[order-success] trackOrder error:", err))
      .finally(() => setLoading(false));
  }, [orderId, phone]);

  return (
    <div className="container-narrow py-16 max-w-2xl">
      <div className="text-center">
        <div className="h-20 w-20 mx-auto rounded-full bg-green-100 grid place-items-center">
          <CheckCircle2 className="h-10 w-10 text-green-700" />
        </div>
        <h1 className="mt-6 font-display text-4xl md:text-5xl text-maroon">Order Confirmed</h1>
        <p className="mt-3 text-muted-foreground">
          Thank you — your handmade piece is being prepared with care.
        </p>
      </div>

      <div className="mt-10 bg-card rounded-2xl p-6 md:p-8 shadow-soft relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-card/60 backdrop-blur-[2px] grid place-items-center z-10">
            <Loader2 className="h-8 w-8 text-maroon animate-spin" />
          </div>
        )}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Order Number</div>
            <div className="font-display text-lg text-maroon">
              {order?.orderNumber ?? orderId ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Payment</div>
            <div className="font-medium">
              {order ? `${order.payment} · ${order.paymentStatus}` : "Pending verification"}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Delivery</div>
            <div className="font-medium">3–5 business days</div>
          </div>
        </div>
        {order && (
          <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-xs text-muted-foreground">Customer</div>
              <div className="font-medium">{order.customer}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Phone</div>
              <div className="font-medium">{order.phone}</div>
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total</div>
              <div className="font-display text-lg text-maroon font-semibold">
                {taka(order.total)}
              </div>
            </div>
          </div>
        )}
        {!loading && !order && orderId && (
          <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
            Order details are being processed. You can track your order with the order number above.
          </div>
        )}
        <div className="mt-6 pt-6 border-t border-border flex items-center gap-3">
          <Package className="h-5 w-5 text-gold" />
          <div className="text-sm">
            We'll send you SMS updates on{" "}
            <span className="font-semibold">{order?.phone ?? phone ?? "your phone"}</span>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          to="/track-order"
          search={orderId ? { orderId, phone: phone ?? "" } : undefined}
          className="bg-maroon text-primary-foreground rounded-full px-7 py-3 text-sm font-semibold text-center"
        >
          Track Order
        </Link>
        <Link
          to="/shop"
          className="border border-border rounded-full px-7 py-3 text-sm font-semibold text-center inline-flex items-center justify-center gap-1"
        >
          Continue Shopping <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}

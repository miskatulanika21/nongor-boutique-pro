import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { useAdmin } from "@/store/admin";
import { taka } from "@/lib/format";
import { Search, Download, Eye, Printer } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { Order } from "@/data/mock";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders Management — Nongor" }] }),
  component: Page,
});

function Page() {
  const { orders, updateOrderStatus } = useAdmin();
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [paymentFilter, setPaymentFilter] = useState("All payments");

  const filtered = orders.filter((o) => {
    const matchesSearch = `${o.id} ${o.customer} ${o.phone}`
      .toLowerCase()
      .includes(q.toLowerCase());
    const matchesStatus = statusFilter === "All statuses" || o.status === statusFilter;
    const matchesPayment =
      paymentFilter === "All payments" ||
      (paymentFilter === "COD" && o.payment === "COD") ||
      (paymentFilter === "bKash" && o.payment === "bKash") ||
      (paymentFilter === "Nagad" && o.payment === "Nagad") ||
      (paymentFilter === "Rocket" && o.payment === "Rocket") ||
      (paymentFilter === "Card" && o.payment === "Card") ||
      (paymentFilter === "ShurjoPay" && o.payment === "ShurjoPay");

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const exportCSV = () => {
    toast.success("CSV Export started for " + filtered.length + " orders!");
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle={`${orders.length} orders total`}
        actions={
          <button
            onClick={exportCSV}
            className="bg-card border border-border rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1 cursor-pointer hover:bg-cream transition"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        }
      />
      <TableShell
        toolbar={
          <>
            <div className="flex items-center bg-secondary rounded-lg px-3 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by ID, name, phone..."
                className="bg-transparent outline-none px-2 h-9 text-sm flex-1"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-secondary border-0 outline-none rounded-lg px-3 h-9 text-sm"
            >
              <option>All statuses</option>
              <option>Pending</option>
              <option>Confirmed</option>
              <option>Processing</option>
              <option>Packed</option>
              <option>Shipped</option>
              <option>Delivered</option>
              <option>Cancelled</option>
            </select>
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="bg-secondary border-0 outline-none rounded-lg px-3 h-9 text-sm"
            >
              <option>All payments</option>
              <option>COD</option>
              <option>bKash</option>
              <option>Nagad</option>
              <option>Rocket</option>
              <option>Card</option>
              <option>ShurjoPay</option>
            </select>
          </>
        }
      >
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground">
            <tr>
              <th className="text-left p-3">Order</th>
              <th className="text-left p-3">Customer</th>
              <th className="text-left p-3">District</th>
              <th className="text-left p-3">Total</th>
              <th className="text-left p-3">Payment</th>
              <th className="text-left p-3">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border/40">
                <td className="p-3 font-medium text-maroon">
                  {o.id}
                  <div className="text-xs text-muted-foreground font-normal">{o.date}</div>
                </td>
                <td className="p-3 font-medium">
                  {o.customer}
                  <div className="text-xs text-muted-foreground font-normal">{o.phone}</div>
                </td>
                <td className="p-3">{o.district}</td>
                <td className="p-3 font-semibold">{taka(o.total)}</td>
                <td className="p-3">
                  <StatusPill status={o.paymentStatus} />
                  <span className="text-[10px] text-muted-foreground ml-1">({o.payment})</span>
                </td>
                <td className="p-3">
                  <StatusPill status={o.status} />
                </td>
                <td className="p-3 text-right">
                  <Sheet>
                    <SheetTrigger className="p-1.5 rounded hover:bg-cream hover:text-maroon transition inline-block cursor-pointer">
                      <Eye className="h-4 w-4" />
                    </SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                      <OrderDetailsSection order={o} onUpdate={updateOrderStatus} />
                    </SheetContent>
                  </Sheet>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-muted-foreground">
                  No orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

function OrderDetailsSection({
  order,
  onUpdate,
}: {
  order: Order;
  onUpdate: (id: string, status: Order["status"]) => void;
}) {
  const [selectedStatus, setSelectedStatus] = useState<Order["status"]>(order.status);

  const handleUpdate = () => {
    onUpdate(order.id, selectedStatus);
    toast.success(`Order ${order.id} updated to ${selectedStatus}`);
  };

  const handlePrint = () => {
    toast.success(`Sent receipt for ${order.id} to printer!`);
  };

  return (
    <div>
      <h3 className="font-display text-2xl text-maroon font-semibold">{order.id}</h3>
      <p className="text-xs text-muted-foreground">Placed on {order.date}</p>
      <div className="mt-6 space-y-4 text-sm">
        <Section title="Customer">
          <div className="font-medium">{order.customer}</div>
          <div className="text-muted-foreground">{order.phone}</div>
        </Section>
        <Section title="Delivery">
          <div>{order.district}</div>
          <div className="text-muted-foreground mt-1">
            Courier Partner:{" "}
            <span className="font-medium text-foreground">{order.courier ?? "Not Assigned"}</span>
            {order.trackingId && (
              <>
                {" "}
                · Tracking: <span className="font-mono">{order.trackingId}</span>
              </>
            )}
          </div>
        </Section>
        <Section title="Payment Details">
          <div className="flex items-center justify-between">
            <span className="font-medium">{order.payment} Gateway</span>
            <StatusPill status={order.paymentStatus} />
          </div>
          {order.trxId && (
            <div className="mt-2 text-xs font-mono bg-cream/80 p-1.5 rounded border border-gold/25 text-charcoal">
              TrxID: {order.trxId}
            </div>
          )}
        </Section>
        <Section title="Change Order Status">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as Order["status"])}
            className="w-full bg-secondary border-0 outline-none rounded-lg px-3 py-2 mt-1 text-sm cursor-pointer"
          >
            {[
              "Pending",
              "Confirmed",
              "Processing",
              "Packed",
              "Shipped",
              "Delivered",
              "Cancelled",
            ].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Section>
        <Section title="Total Price">
          <div className="font-display text-2xl text-maroon font-bold">{taka(order.total)}</div>
        </Section>
        <div className="flex gap-2 pt-4">
          <button
            onClick={handleUpdate}
            className="flex-1 bg-maroon text-primary-foreground hover:bg-maroon-deep rounded-lg py-2.5 text-sm font-semibold transition cursor-pointer"
          >
            Update Order
          </button>
          <button
            onClick={handlePrint}
            className="px-3 rounded-lg border border-border hover:bg-cream transition cursor-pointer"
            aria-label="Print order receipt"
          >
            <Printer className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-secondary/40 rounded-lg p-3">
      <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1 font-semibold">
        {title}
      </div>
      {children}
    </div>
  );
}

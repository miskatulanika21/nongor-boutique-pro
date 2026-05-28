import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { useAdmin } from "@/store/admin";
import { taka } from "@/lib/format";
import { Check, X, Clock, Image as ImageIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/payments")({
  head: () => ({ meta: [{ title: "Payment Verification — Nongor" }] }),
  component: Page,
});

function Page() {
  const { orders, approvePayment, rejectPayment, resetPayment } = useAdmin();
  const [methodFilter, setMethodFilter] = useState("All methods");

  // Filter out COD orders as they do not require transaction code verification
  const nonCodOrders = orders.filter((o) => o.payment !== "COD");

  const filtered = nonCodOrders.filter((o) => {
    if (methodFilter === "All methods") return true;
    return o.payment === methodFilter;
  });

  const needsVerificationCount = nonCodOrders.filter(
    (o) => o.paymentStatus === "Verification Needed" || o.paymentStatus === "Pending"
  ).length;

  const approvedCount = nonCodOrders.filter((o) => o.paymentStatus === "Paid").length;
  const rejectedCount = nonCodOrders.filter((o) => o.paymentStatus === "Failed").length;
  const totalMfsVolume = nonCodOrders
    .filter((o) => o.paymentStatus === "Paid")
    .reduce((sum, o) => sum + o.total, 0);

  const handleApprove = (orderId: string) => {
    approvePayment(orderId);
    toast.success(`Payment approved for order ${orderId}. Status set to Paid/Confirmed.`);
  };

  const handleReject = (orderId: string) => {
    rejectPayment(orderId);
    toast.error(`Payment rejected for order ${orderId}. Status set to Failed.`);
  };

  const handleReset = (orderId: string) => {
    resetPayment(orderId);
    toast.warning(`Payment reset back to Pending verification for order ${orderId}.`);
  };

  return (
    <div>
      <PageHeader title="Payment Verification" subtitle="Verify bKash, Nagad, Rocket & card payments" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l: "Needs Verification", v: String(needsVerificationCount), c: "bg-orange-50 text-orange-800 border border-orange-200" },
          { l: "Approved Payments", v: String(approvedCount), c: "bg-green-50 text-green-800 border border-green-200" },
          { l: "Rejected", v: String(rejectedCount), c: "bg-red-50 text-red-800 border border-red-200" },
          { l: "Verified Volume", v: taka(totalMfsVolume), c: "bg-pink-50 text-pink-800 border border-pink-200" },
        ].map((s) => (
          <div key={s.l} className={`rounded-xl p-4 ${s.c}`}>
            <div className="text-xs font-semibold uppercase tracking-wider">{s.l}</div>
            <div className="font-display text-2xl font-bold mt-1">{s.v}</div>
          </div>
        ))}
      </div>
      <TableShell
        toolbar={
          <>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-secondary border-0 outline-none rounded-lg px-3 h-9 text-sm cursor-pointer"
            >
              <option>All methods</option>
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
              <th className="text-left p-3">Method</th>
              <th className="text-left p-3">TrxID</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Screenshot</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3">Verify Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border/40">
                <td className="p-3 font-medium text-maroon">{o.id}</td>
                <td className="p-3 font-medium">
                  {o.customer}
                  <div className="text-xs text-muted-foreground font-normal">{o.phone}</div>
                </td>
                <td className="p-3">
                  <span className="text-xs px-2.5 py-1 rounded bg-secondary font-semibold text-charcoal">
                    {o.payment}
                  </span>
                </td>
                <td className="p-3 font-mono text-xs font-semibold text-foreground">
                  {o.trxId || "N/A"}
                </td>
                <td className="p-3 font-semibold">{taka(o.total)}</td>
                <td className="p-3">
                  <div className="h-12 w-10 bg-secondary rounded grid place-items-center cursor-pointer hover:bg-cream border transition" title="View receipt attachment">
                    <ImageIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                </td>
                <td className="p-3">
                  <StatusPill status={o.paymentStatus} />
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => handleApprove(o.id)}
                    disabled={o.paymentStatus === "Paid"}
                    className={`h-8 w-8 inline-grid place-items-center rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition cursor-pointer ${
                      o.paymentStatus === "Paid" ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                    title="Approve & Mark Paid"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReject(o.id)}
                    disabled={o.paymentStatus === "Failed"}
                    className={`h-8 w-8 inline-grid place-items-center rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition cursor-pointer ml-1.5 ${
                      o.paymentStatus === "Failed" ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                    title="Reject Payment"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleReset(o.id)}
                    disabled={o.paymentStatus === "Pending" || o.paymentStatus === "Verification Needed"}
                    className={`h-8 w-8 inline-grid place-items-center rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition cursor-pointer ml-1.5 ${
                      (o.paymentStatus === "Pending" || o.paymentStatus === "Verification Needed")
                        ? "opacity-30 cursor-not-allowed" : ""
                    }`}
                    title="Revert back to Pending Verification"
                  >
                    <Clock className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No online payment orders found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

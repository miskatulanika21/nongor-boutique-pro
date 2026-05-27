import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { orders } from "@/data/mock";
import { taka } from "@/lib/format";
import { Search, Download, Eye, Printer } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Route = createFileRoute("/admin/orders")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const filtered = orders.filter((o) => `${o.id} ${o.customer} ${o.phone}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} orders`} actions={
        <button className="bg-card border border-border rounded-lg px-4 py-2 text-sm font-medium flex items-center gap-1"><Download className="h-4 w-4" /> Export CSV</button>
      } />
      <TableShell toolbar={
        <>
          <div className="flex items-center bg-secondary rounded-lg px-3 flex-1 max-w-sm"><Search className="h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by ID, name, phone..." className="bg-transparent outline-none px-2 h-9 text-sm flex-1" /></div>
          <select className="bg-secondary rounded-lg px-3 h-9 text-sm"><option>All statuses</option><option>Pending</option><option>Shipped</option><option>Delivered</option></select>
          <select className="bg-secondary rounded-lg px-3 h-9 text-sm"><option>All payments</option><option>bKash</option><option>Nagad</option><option>COD</option></select>
        </>
      }>
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">District</th><th className="text-left p-3">Total</th><th className="text-left p-3">Payment</th><th className="text-left p-3">Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((o) => (
              <tr key={o.id} className="border-t border-border/40">
                <td className="p-3 font-medium text-maroon">{o.id}<div className="text-xs text-muted-foreground font-normal">{o.date}</div></td>
                <td className="p-3">{o.customer}<div className="text-xs text-muted-foreground">{o.phone}</div></td>
                <td className="p-3">{o.district}</td>
                <td className="p-3 font-medium">{taka(o.total)}</td>
                <td className="p-3"><StatusPill status={o.paymentStatus} /></td>
                <td className="p-3"><StatusPill status={o.status} /></td>
                <td className="p-3 text-right">
                  <Sheet>
                    <SheetTrigger className="p-1 hover:text-maroon"><Eye className="h-4 w-4" /></SheetTrigger>
                    <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
                      <h3 className="font-display text-2xl text-maroon">{o.id}</h3>
                      <div className="mt-4 space-y-4 text-sm">
                        <Section title="Customer"><div>{o.customer}</div><div className="text-muted-foreground">{o.phone}</div></Section>
                        <Section title="Delivery"><div>{o.district}</div><div className="text-muted-foreground">Courier: {o.courier ?? "Not assigned"} {o.trackingId && `· ${o.trackingId}`}</div></Section>
                        <Section title="Payment"><div className="flex items-center justify-between">{o.payment} <StatusPill status={o.paymentStatus} /></div></Section>
                        <Section title="Order Status">
                          <select defaultValue={o.status} className="w-full bg-secondary rounded-lg px-3 py-2 mt-1">{["Pending","Confirmed","Processing","Packed","Shipped","Delivered","Cancelled"].map(s=><option key={s}>{s}</option>)}</select>
                        </Section>
                        <Section title="Total"><div className="font-display text-2xl text-maroon">{taka(o.total)}</div></Section>
                        <div className="flex gap-2 pt-3"><button className="flex-1 bg-maroon text-primary-foreground rounded-lg py-2 text-sm font-semibold">Update</button><button className="px-3 rounded-lg border border-border"><Printer className="h-4 w-4" /></button></div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="bg-secondary/40 rounded-lg p-3"><div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{title}</div>{children}</div>;
}

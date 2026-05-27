import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell } from "@/components/admin/ui";
import { orders } from "@/data/mock";
import { Truck } from "lucide-react";

export const Route = createFileRoute("/admin/courier")({ component: Page });

const partners = ["Steadfast", "Pathao", "RedX", "Sundarban", "Manual"];
const zones = [
  { zone: "Inside Dhaka", price: 60, eta: "1-2 days" },
  { zone: "Outside Dhaka", price: 120, eta: "3-5 days" },
  { zone: "Chattogram", price: 100, eta: "2-4 days" },
  { zone: "Remote Area", price: 150, eta: "5-7 days" },
];

function Page() {
  return (
    <div>
      <PageHeader title="Courier & Delivery" subtitle="Manage courier partners, zones and tracking" />
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <div className="bg-card rounded-xl p-5 border border-border/60">
          <h3 className="font-display text-lg mb-3 flex items-center gap-2"><Truck className="h-4 w-4 text-maroon" /> Courier Partners</h3>
          <div className="grid grid-cols-2 gap-2">
            {partners.map((p) => (
              <div key={p} className="bg-secondary rounded-lg p-3 flex items-center justify-between"><span className="font-medium text-sm">{p}</span><button className="text-xs text-maroon font-semibold">Book →</button></div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">API integration coming soon — UI-ready.</p>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border/60">
          <h3 className="font-display text-lg mb-3">Delivery Zones</h3>
          <table className="w-full text-sm">
            <tbody>
              {zones.map((z) => (
                <tr key={z.zone} className="border-b border-border/30"><td className="py-2">{z.zone}</td><td className="py-2 text-maroon font-medium">৳{z.price}</td><td className="py-2 text-xs text-muted-foreground">{z.eta}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <TableShell>
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">District</th><th className="text-left p-3">Courier</th><th className="text-left p-3">Tracking ID</th><th></th></tr></thead>
          <tbody>
            {orders.filter(o => o.courier).map((o) => (
              <tr key={o.id} className="border-t border-border/40">
                <td className="p-3 font-medium text-maroon">{o.id}</td>
                <td className="p-3">{o.customer}</td>
                <td className="p-3">{o.district}</td>
                <td className="p-3">{o.courier}</td>
                <td className="p-3 font-mono text-xs">{o.trackingId}</td>
                <td className="p-3 text-right"><button className="text-xs text-maroon font-semibold">Track →</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

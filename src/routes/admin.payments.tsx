import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { orders } from "@/data/mock";
import { taka } from "@/lib/format";
import { Check, X, Clock, Image as ImageIcon } from "lucide-react";

export const Route = createFileRoute("/admin/payments")({ component: Page });

function Page() {
  const payments = orders.filter((o) => o.payment !== "COD");
  return (
    <div>
      <PageHeader title="Payment Verification" subtitle="Verify bKash, Nagad, Rocket & card payments" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { l: "Needs Verification", v: "3", c: "bg-orange-50 text-orange-800" },
          { l: "Approved Today", v: "24", c: "bg-green-50 text-green-800" },
          { l: "Rejected", v: "2", c: "bg-red-50 text-red-800" },
          { l: "Total bKash", v: taka(184200), c: "bg-pink-50 text-pink-800" },
        ].map((s) => <div key={s.l} className={`rounded-xl p-4 ${s.c}`}><div className="text-xs">{s.l}</div><div className="font-display text-2xl mt-1">{s.v}</div></div>)}
      </div>
      <TableShell toolbar={<><select className="bg-secondary rounded-lg px-3 h-9 text-sm"><option>All methods</option><option>bKash</option><option>Nagad</option><option>Rocket</option><option>Card</option></select></>}>
        <table className="w-full text-sm min-w-[800px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Method</th><th className="text-left p-3">TrxID</th><th className="text-left p-3">Amount</th><th className="text-left p-3">Screenshot</th><th className="text-left p-3">Status</th><th></th></tr></thead>
          <tbody>
            {payments.map((o, i) => (
              <tr key={o.id} className="border-t border-border/40">
                <td className="p-3 font-medium text-maroon">{o.id}</td>
                <td className="p-3">{o.customer}<div className="text-xs text-muted-foreground">{o.phone}</div></td>
                <td className="p-3"><span className="text-xs px-2 py-0.5 rounded bg-secondary font-medium">{o.payment}</span></td>
                <td className="p-3 font-mono text-xs">{["9BHX22YT01","NGD-44120","RKT-99211"][i % 3]}</td>
                <td className="p-3 font-medium">{taka(o.total)}</td>
                <td className="p-3"><div className="h-12 w-10 bg-secondary rounded grid place-items-center"><ImageIcon className="h-4 w-4 text-muted-foreground" /></div></td>
                <td className="p-3"><StatusPill status={o.paymentStatus} /></td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button className="h-8 w-8 grid place-items-center rounded-lg bg-green-100 text-green-700 hover:bg-green-200 inline-grid"><Check className="h-4 w-4" /></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg bg-red-100 text-red-700 hover:bg-red-200 inline-grid ml-1"><X className="h-4 w-4" /></button>
                  <button className="h-8 w-8 grid place-items-center rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 inline-grid ml-1"><Clock className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

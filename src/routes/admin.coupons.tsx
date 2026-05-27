import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { coupons } from "@/data/mock";
import { Plus, Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/coupons")({ component: Page });

function Page() {
  return (
    <div>
      <PageHeader title="Coupons & Offers" actions={<button className="bg-maroon text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1"><Plus className="h-4 w-4" /> New Coupon</button>} />
      <TableShell>
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Code</th><th className="text-left p-3">Type</th><th className="text-left p-3">Value</th><th className="text-left p-3">Min Order</th><th className="text-left p-3">Expiry</th><th className="text-left p-3">Used</th><th className="text-left p-3">Status</th><th></th></tr></thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} className="border-t border-border/40">
                <td className="p-3 font-mono text-maroon font-semibold">{c.code}</td>
                <td className="p-3">{c.type}</td>
                <td className="p-3 font-medium">{c.type === "Percentage" ? `${c.value}%` : c.type === "Flat" ? `৳${c.value}` : "—"}</td>
                <td className="p-3">৳{c.minOrder}</td>
                <td className="p-3 text-xs">{c.expiry}</td>
                <td className="p-3">{c.uses}</td>
                <td className="p-3"><StatusPill status={c.active ? "Active" : "Archived"} /></td>
                <td className="p-3 text-right"><button className="p-1 hover:text-maroon"><Edit className="h-4 w-4" /></button><button className="p-1 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

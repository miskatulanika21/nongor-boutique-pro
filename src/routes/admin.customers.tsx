import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { customers } from "@/data/mock";
import { taka } from "@/lib/format";
import { Eye } from "lucide-react";

export const Route = createFileRoute("/admin/customers")({ component: Page });

function Page() {
  return (
    <div>
      <PageHeader title="Customers" subtitle={`${customers.length} customers`} />
      <TableShell>
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Name</th><th className="text-left p-3">Phone</th><th className="text-left p-3">Orders</th><th className="text-left p-3">Spend</th><th className="text-left p-3">Last Order</th><th className="text-left p-3">Status</th><th></th></tr></thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-t border-border/40">
                <td className="p-3 flex items-center gap-2"><div className="h-8 w-8 rounded-full bg-cream text-maroon grid place-items-center text-xs font-semibold">{c.name[0]}</div><div><div className="font-medium">{c.name}</div><div className="text-xs text-muted-foreground">{c.email}</div></div></td>
                <td className="p-3">{c.phone}</td>
                <td className="p-3">{c.totalOrders}</td>
                <td className="p-3 font-medium text-maroon">{taka(c.totalSpend)}</td>
                <td className="p-3 text-xs">{c.lastOrder}</td>
                <td className="p-3"><StatusPill status={c.status} /></td>
                <td className="p-3 text-right"><button className="p-1 hover:text-maroon"><Eye className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

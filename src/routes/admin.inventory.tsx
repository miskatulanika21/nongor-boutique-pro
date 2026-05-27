import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatCard } from "@/components/admin/ui";
import { products } from "@/data/mock";
import { AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/admin/inventory")({ component: Page });

function Page() {
  const low = products.filter(p => p.stock <= 5);
  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock and variant overview" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total SKUs" value={String(products.length)} />
        <StatCard label="Low Stock" value={String(low.length)} accent="warn" />
        <StatCard label="Out of Stock" value="0" />
        <StatCard label="Avg Stock" value={String(Math.round(products.reduce((s, p) => s + p.stock, 0) / products.length))} />
      </div>
      {low.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />
          <div><div className="font-semibold text-amber-900 text-sm">{low.length} products running low</div><div className="text-xs text-amber-800 mt-0.5">Consider restocking soon</div></div>
        </div>
      )}
      <TableShell>
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Product</th><th className="text-left p-3">Sizes</th><th className="text-left p-3">Colors</th><th className="text-left p-3">Stock</th><th></th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3 flex items-center gap-3"><img src={p.images[0]} className="h-10 w-8 rounded object-cover" alt="" /><span className="font-medium">{p.name}</span></td>
                <td className="p-3 text-xs">{p.sizes.join(", ")}</td>
                <td className="p-3"><div className="flex gap-1">{p.colors.map(c => <span key={c.name} className="h-4 w-4 rounded-full border" style={{ background: c.hex }} title={c.name} />)}</div></td>
                <td className="p-3"><span className={`font-semibold ${p.stock <= 5 ? "text-amber-700" : "text-foreground"}`}>{p.stock}</span></td>
                <td className="p-3 text-right"><button className="text-xs text-maroon font-semibold">Update</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

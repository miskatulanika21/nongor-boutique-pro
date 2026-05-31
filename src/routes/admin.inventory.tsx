import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatCard } from "@/components/admin/ui";
import { useAdmin } from "@/store/admin";
import { AlertTriangle, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/inventory")({
  head: () => ({ meta: [{ title: "Inventory Management — Admin" }] }),
  component: Page,
});

function Page() {
  const { products, updateProduct } = useAdmin();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editStock, setEditStock] = useState<number>(0);

  const low = products.filter((p) => p.stock <= 5);
  const outOfStockCount = products.filter((p) => p.stock === 0).length;
  const avgStock = products.length
    ? Math.round(products.reduce((s, p) => s + p.stock, 0) / products.length)
    : 0;

  const startEdit = (id: string, currentStock: number) => {
    setEditingId(id);
    setEditStock(currentStock);
  };

  const saveStock = (id: string) => {
    const stockVal = Math.max(0, editStock);
    updateProduct(id, { stock: stockVal });
    setEditingId(null);
    toast.success("Stock level updated successfully!");
  };

  return (
    <div>
      <PageHeader title="Inventory" subtitle="Stock and variant overview" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total SKUs" value={String(products.length)} />
        <StatCard
          label="Low Stock"
          value={String(low.length)}
          accent={low.length > 0 ? "warn" : "good"}
        />
        <StatCard
          label="Out of Stock"
          value={String(outOfStockCount)}
          accent={outOfStockCount > 0 ? "warn" : "good"}
        />
        <StatCard label="Avg Stock" value={String(avgStock)} />
      </div>
      {low.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-900 text-sm">
              {low.length} products running low
            </div>
            <div className="text-xs text-amber-800 mt-0.5">
              Consider updating stock level or restocking soon.
            </div>
          </div>
        </div>
      )}
      <TableShell>
        <table className="w-full text-sm min-w-[600px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Sizes Available</th>
              <th className="text-left p-3">Colors</th>
              <th className="text-left p-3">Stock level</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3 flex items-center gap-3">
                  <img src={p.images[0]} className="h-10 w-8 rounded object-cover" alt="" />
                  <span className="font-medium">{p.name}</span>
                </td>
                <td className="p-3 text-xs">{p.sizes.join(", ")}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    {p.colors.map((c) => (
                      <span
                        key={c.name}
                        className="h-4 w-4 rounded-full border border-border/80"
                        style={{ background: c.hex }}
                        title={c.name}
                      />
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  {editingId === p.id ? (
                    <input
                      type="number"
                      value={editStock}
                      onChange={(e) => setEditStock(Number(e.target.value))}
                      className="w-20 px-2 py-1 text-sm rounded bg-secondary border border-border outline-none"
                      min="0"
                      autoFocus
                    />
                  ) : (
                    <span
                      className={`font-semibold ${p.stock <= 5 ? "text-amber-700 font-bold" : "text-foreground"}`}
                    >
                      {p.stock} units
                    </span>
                  )}
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  {editingId === p.id ? (
                    <div className="flex justify-end gap-1.5">
                      <button
                        onClick={() => saveStock(p.id)}
                        className="h-7 w-7 grid place-items-center rounded bg-green-100 text-green-700 hover:bg-green-200 transition cursor-pointer"
                        title="Save Stock"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="h-7 w-7 grid place-items-center rounded bg-secondary text-muted-foreground hover:bg-cream border border-border transition cursor-pointer"
                        title="Cancel"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => startEdit(p.id, p.stock)}
                      className="text-xs text-maroon font-semibold hover:text-maroon-deep cursor-pointer"
                    >
                      Update
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

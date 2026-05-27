import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { products } from "@/data/mock";
import { taka } from "@/lib/format";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";

export const Route = createFileRoute("/admin/products")({ component: Page });

function Page() {
  const [q, setQ] = useState("");
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <PageHeader title="Products" subtitle={`${products.length} products`} actions={
        <Dialog>
          <DialogTrigger className="bg-maroon text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1"><Plus className="h-4 w-4" /> Add Product</DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogTitle className="font-display text-2xl">Add Product</DialogTitle>
            <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
              {["Product name", "Slug", "Price", "Discount price", "Category", "Collection", "Fabric"].map(l => (
                <div key={l}><label className="text-xs text-muted-foreground">{l}</label><input className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm" /></div>
              ))}
              <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Description</label><textarea rows={3} className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary" /></div>
              <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Sizes (comma separated)</label><input placeholder="S, M, L, XL" className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary" /></div>
              <div className="md:col-span-2 border-2 border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">Drop product images here</div>
              <div className="md:col-span-2 flex gap-4 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-maroon" /> Featured</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-maroon" /> New Arrival</label>
                <label className="flex items-center gap-2"><input type="checkbox" className="accent-maroon" /> Best Seller</label>
              </div>
              <div className="md:col-span-2 flex justify-end gap-2 pt-3"><button className="px-4 py-2 rounded-lg border border-border text-sm">Save Draft</button><button className="px-5 py-2 rounded-lg bg-maroon text-primary-foreground text-sm font-semibold">Publish</button></div>
            </div>
          </DialogContent>
        </Dialog>
      } />
      <TableShell toolbar={
        <>
          <div className="flex items-center bg-secondary rounded-lg px-3 flex-1 max-w-sm"><Search className="h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." className="bg-transparent outline-none px-2 h-9 text-sm flex-1" /></div>
          <select className="bg-secondary rounded-lg px-3 h-9 text-sm"><option>All categories</option><option>Kurti</option></select>
          <select className="bg-secondary rounded-lg px-3 h-9 text-sm"><option>All status</option><option>Published</option><option>Draft</option></select>
        </>
      }>
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Product</th><th className="text-left p-3">Category</th><th className="text-left p-3">Price</th><th className="text-left p-3">Stock</th><th className="text-left p-3">Status</th><th></th></tr></thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3 flex items-center gap-3"><img src={p.images[0]} className="h-12 w-10 rounded object-cover" alt="" /><div><div className="font-medium">{p.name}</div><div className="text-xs text-muted-foreground">{p.slug}</div></div></td>
                <td className="p-3">{p.category}</td>
                <td className="p-3 font-medium text-maroon">{taka(p.discountPrice ?? p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3"><StatusPill status={p.status} /></td>
                <td className="p-3 text-right"><button className="p-1 hover:text-maroon"><Edit className="h-4 w-4" /></button><button className="p-1 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

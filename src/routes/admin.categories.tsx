import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, StatusPill } from "@/components/admin/ui";
import { categories } from "@/data/mock";
import { Plus, Edit, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/categories")({ component: Page });

function Page() {
  return (
    <div>
      <PageHeader title="Categories & Collections" actions={<button className="bg-maroon text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1"><Plus className="h-4 w-4" /> Add Category</button>} />
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {categories.map((c) => (
          <div key={c.id} className="bg-card rounded-xl overflow-hidden border border-border/60">
            <img src={c.image} alt="" className="aspect-square w-full object-cover" />
            <div className="p-4">
              <div className="font-medium">{c.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{c.count} products</div>
              <div className="mt-3 flex items-center justify-between">
                <StatusPill status={c.status} />
                <div><button className="p-1 hover:text-maroon"><Edit className="h-4 w-4" /></button><button className="p-1 hover:text-destructive"><Trash2 className="h-4 w-4" /></button></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

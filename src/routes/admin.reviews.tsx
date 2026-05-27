import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { reviews } from "@/data/mock";
import { Check, EyeOff, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({ component: Page });

function Page() {
  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${reviews.length} reviews`} />
      <TableShell>
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Product</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Rating</th><th className="text-left p-3">Review</th><th className="text-left p-3">Status</th><th></th></tr></thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id} className="border-t border-border/40">
                <td className="p-3 font-medium">{r.product}</td>
                <td className="p-3 text-sm">{r.customer}</td>
                <td className="p-3 text-gold">{"★".repeat(r.rating)}</td>
                <td className="p-3 text-sm text-muted-foreground max-w-xs">{r.text}</td>
                <td className="p-3"><StatusPill status={r.status} /></td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button className="p-1 hover:text-green-700"><Check className="h-4 w-4" /></button>
                  <button className="p-1 hover:text-muted-foreground"><EyeOff className="h-4 w-4" /></button>
                  <button className="p-1 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>
    </div>
  );
}

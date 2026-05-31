import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { useReviews } from "@/hooks/useReviews";
import { Check, EyeOff, Trash2, Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/reviews")({ component: Page });

function Page() {
  const { reviews, loading, approve, deleteReview } = useReviews();

  return (
    <div>
      <PageHeader title="Reviews" subtitle={`${reviews.length} reviews`} />
      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-maroon" />
          <p className="text-sm text-muted-foreground mt-2">Loading reviews…</p>
        </div>
      ) : (
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
                    {r.status === "Pending" && (
                      <button onClick={() => approve(r.id)} className="p-1 hover:text-green-700" title="Approve"><Check className="h-4 w-4" /></button>
                    )}
                    <button className="p-1 hover:text-muted-foreground" title="Hide (coming soon)"><EyeOff className="h-4 w-4" /></button>
                    <button onClick={() => { if (confirm("Delete review?")) deleteReview(r.id); }} className="p-1 hover:text-destructive" title="Delete"><Trash2 className="h-4 w-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableShell>
      )}
    </div>
  );
}

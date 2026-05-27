import { type ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="font-display text-2xl md:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, delta, accent }: { label: string; value: string; delta?: string; accent?: "good" | "warn" }) {
  return (
    <div className="bg-card rounded-xl p-5 border border-border/60">
      <div className="text-xs text-muted-foreground uppercase tracking-wider">{label}</div>
      <div className="mt-2 font-display text-2xl md:text-3xl text-maroon">{value}</div>
      {delta && <div className={`mt-1 text-xs ${accent === "good" ? "text-green-700" : accent === "warn" ? "text-amber-700" : "text-muted-foreground"}`}>{delta}</div>}
    </div>
  );
}

export function TableShell({ children, toolbar }: { children: ReactNode; toolbar?: ReactNode }) {
  return (
    <div className="bg-card rounded-xl border border-border/60 overflow-hidden">
      {toolbar && <div className="p-4 border-b border-border/60 flex flex-wrap gap-2 items-center">{toolbar}</div>}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Delivered: "bg-green-100 text-green-800",
    Shipped: "bg-blue-100 text-blue-800",
    Processing: "bg-amber-100 text-amber-800",
    Packed: "bg-purple-100 text-purple-800",
    Confirmed: "bg-cyan-100 text-cyan-800",
    Pending: "bg-gray-100 text-gray-700",
    Cancelled: "bg-red-100 text-red-800",
    Paid: "bg-green-100 text-green-800",
    Failed: "bg-red-100 text-red-800",
    COD: "bg-amber-100 text-amber-800",
    "Verification Needed": "bg-orange-100 text-orange-800",
    Active: "bg-green-100 text-green-800",
    Flagged: "bg-red-100 text-red-800",
    Approved: "bg-green-100 text-green-800",
    "Coming Soon": "bg-amber-100 text-amber-800",
    Published: "bg-green-100 text-green-800",
    Draft: "bg-gray-100 text-gray-700",
    Archived: "bg-red-100 text-red-800",
  };
  return <span className={`text-[10px] font-semibold px-2 py-1 rounded-full whitespace-nowrap ${map[status] ?? "bg-secondary"}`}>{status}</span>;
}

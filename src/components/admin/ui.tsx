import { type ReactNode } from "react";

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3 mb-7 pb-5 border-b border-hairline">
      <div>
        <h1 className="font-display text-2xl md:text-3xl tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, delta, accent }: { label: string; value: string; delta?: string; accent?: "good" | "warn" }) {
  return (
    <div className="relative bg-card rounded-2xl p-5 border border-hairline overflow-hidden group hover:shadow-soft transition-shadow ease-soft">
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
      <div className="text-[10px] text-muted-foreground uppercase tracking-[0.18em] font-semibold">{label}</div>
      <div className="mt-2.5 font-display text-2xl md:text-3xl text-maroon tracking-tight">{value}</div>
      {delta && (
        <div className={`mt-1.5 text-xs font-medium inline-flex items-center gap-1 ${
          accent === "good" ? "text-emerald-700" : accent === "warn" ? "text-amber-700" : "text-muted-foreground"
        }`}>
          {delta}
        </div>
      )}
    </div>
  );
}

export function TableShell({ children, toolbar }: { children: ReactNode; toolbar?: ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-hairline overflow-hidden shadow-soft">
      {toolbar && (
        <div className="p-4 border-b border-hairline bg-gradient-to-r from-cream/40 to-ivory flex flex-wrap gap-2 items-center">
          {toolbar}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    Delivered: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Shipped: "bg-sky-50 text-sky-700 ring-sky-200",
    Processing: "bg-amber-50 text-amber-700 ring-amber-200",
    Packed: "bg-violet-50 text-violet-700 ring-violet-200",
    Confirmed: "bg-cyan-50 text-cyan-700 ring-cyan-200",
    Pending: "bg-slate-100 text-slate-700 ring-slate-200",
    Cancelled: "bg-red-50 text-red-700 ring-red-200",
    Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Failed: "bg-red-50 text-red-700 ring-red-200",
    COD: "bg-amber-50 text-amber-800 ring-amber-200",
    "Verification Needed": "bg-orange-50 text-orange-700 ring-orange-200",
    Active: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Flagged: "bg-red-50 text-red-700 ring-red-200",
    Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    "Coming Soon": "bg-amber-50 text-amber-700 ring-amber-200",
    Published: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    Draft: "bg-slate-100 text-slate-700 ring-slate-200",
    Archived: "bg-red-50 text-red-700 ring-red-200",
  };
  return (
    <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ring-1 ring-inset ${map[status] ?? "bg-secondary ring-border"}`}>
      {status}
    </span>
  );
}

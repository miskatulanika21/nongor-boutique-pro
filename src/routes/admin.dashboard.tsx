import { createFileRoute, Link } from "@tanstack/react-router";
import { StatCard, PageHeader, StatusPill } from "@/components/admin/ui";
import { orders, products, salesChart, orderStatusChart } from "@/data/mock";
import { taka } from "@/lib/format";
import { Plus, Package, CreditCard, Image as ImageIcon } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Admin Dashboard — Nongor" }] }),
  component: Dashboard,
});

const COLORS = ["#6b1f2a", "#c79a45", "#9c5566", "#5a1a25"];

function Dashboard() {
  return (
    <div>
      <PageHeader title="Welcome back" subtitle="Here's what's happening at Nongor today." />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <StatCard label="Today's Sales" value={taka(28400)} delta="+18% vs yesterday" accent="good" />
        <StatCard label="Total Revenue" value={taka(1480200)} delta="+9% this month" accent="good" />
        <StatCard label="Pending Orders" value="12" delta="3 need verification" accent="warn" />
        <StatCard label="Customers" value="284" delta="+24 this week" accent="good" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <div className="bg-card rounded-xl p-5 border border-border/60 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg">Revenue · last 7 days</h3>
            <span className="text-xs text-muted-foreground">in ৳</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesChart}>
                <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6b1f2a" stopOpacity={0.5} /><stop offset="100%" stopColor="#6b1f2a" stopOpacity={0} /></linearGradient></defs>
                <XAxis dataKey="day" stroke="#999" fontSize={11} />
                <YAxis stroke="#999" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="sales" stroke="#6b1f2a" fill="url(#g)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-card rounded-xl p-5 border border-border/60">
          <h3 className="font-display text-lg mb-4">Order Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={orderStatusChart} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                  {orderStatusChart.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-1 text-xs">
            {orderStatusChart.map((s, i) => (
              <div key={s.name} className="flex justify-between"><span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: COLORS[i] }} />{s.name}</span><span>{s.value}</span></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-4 mt-6">
        <div className="bg-card rounded-xl border border-border/60">
          <div className="p-5 border-b border-border/60 flex items-center justify-between"><h3 className="font-display text-lg">Recent Orders</h3><Link to="/admin/orders" className="text-xs text-maroon">View all →</Link></div>
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 text-xs text-muted-foreground"><tr><th className="text-left p-3">Order</th><th className="text-left p-3">Customer</th><th className="text-left p-3">Total</th><th className="text-left p-3">Status</th></tr></thead>
            <tbody>
              {orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-t border-border/40"><td className="p-3 font-medium text-maroon">{o.id}</td><td className="p-3">{o.customer}</td><td className="p-3">{taka(o.total)}</td><td className="p-3"><StatusPill status={o.status} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-4">
          <div className="bg-card rounded-xl p-5 border border-border/60">
            <h3 className="font-display text-base mb-3">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/admin/products" className="bg-maroon text-primary-foreground rounded-lg p-3 text-xs font-semibold flex flex-col items-center gap-1"><Plus className="h-4 w-4" />Add Product</Link>
              <Link to="/admin/orders" className="bg-secondary rounded-lg p-3 text-xs font-semibold flex flex-col items-center gap-1"><Package className="h-4 w-4" />View Orders</Link>
              <Link to="/admin/payments" className="bg-secondary rounded-lg p-3 text-xs font-semibold flex flex-col items-center gap-1"><CreditCard className="h-4 w-4" />Verify Payment</Link>
              <Link to="/admin/content" className="bg-secondary rounded-lg p-3 text-xs font-semibold flex flex-col items-center gap-1"><ImageIcon className="h-4 w-4" />Edit Banner</Link>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 border border-border/60">
            <h3 className="font-display text-base mb-3">Best Sellers</h3>
            <div className="space-y-3">
              {products.filter(p => p.isBestSeller).slice(0, 3).map((p) => (
                <div key={p.id} className="flex gap-3"><img src={p.images[0]} className="h-12 w-10 rounded object-cover" alt="" /><div className="flex-1 min-w-0"><div className="text-xs font-medium truncate">{p.name}</div><div className="text-xs text-maroon">{taka(p.discountPrice ?? p.price)}</div></div></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

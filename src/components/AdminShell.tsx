import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, CreditCard, Truck, Users, FolderTree, Ticket, FileImage, Boxes, Star, Settings, Search, Bell, ChevronDown, X, Menu } from "lucide-react";
import { Logo } from "./Logo";
import { useState, type ReactNode } from "react";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/payments", label: "Payments", icon: CreditCard },
  { to: "/admin/courier", label: "Courier", icon: Truck },
  { to: "/admin/customers", label: "Customers", icon: Users },
  { to: "/admin/categories", label: "Categories", icon: FolderTree },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket },
  { to: "/admin/content", label: "Content", icon: FileImage },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes },
  { to: "/admin/reviews", label: "Reviews", icon: Star },
  { to: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = links.find((l) => path.startsWith(l.to));

  const Sidebar = (
    <div className="bg-sidebar text-sidebar-foreground h-full flex flex-col">
      <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
        <Logo dark />
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1"><X className="h-5 w-5" /></button>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map((l) => {
          const isActive = path.startsWith(l.to);
          return (
            <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${isActive ? "bg-sidebar-accent text-sidebar-primary font-semibold" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50"}`}>
              <l.icon className="h-4 w-4" />
              {l.label}
              {isActive && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border">
        <Link to="/" className="text-xs text-sidebar-foreground/60 hover:text-sidebar-primary">← Back to store</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary flex">
      <aside className="hidden md:block w-64 shrink-0 fixed inset-y-0 left-0">{Sidebar}</aside>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72">{Sidebar}</aside>
        </div>
      )}
      <div className="flex-1 md:ml-64 min-w-0">
        <header className="bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16">
            <button className="md:hidden p-2" onClick={() => setMobileOpen(true)}><Menu className="h-5 w-5" /></button>
            <div>
              <div className="text-[11px] text-muted-foreground">Admin Panel</div>
              <div className="font-display text-lg">{active?.label ?? "Dashboard"}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center bg-secondary rounded-lg px-3 w-72">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input placeholder="Search orders, products..." className="bg-transparent border-0 outline-none h-9 px-2 text-sm flex-1" />
              </div>
              <button className="h-10 w-10 grid place-items-center rounded-lg hover:bg-secondary relative">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-maroon" />
              </button>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-secondary">
                <div className="h-8 w-8 rounded-full bg-maroon text-primary-foreground grid place-items-center text-xs font-semibold">N</div>
                <ChevronDown className="h-4 w-4 hidden md:block" />
              </button>
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

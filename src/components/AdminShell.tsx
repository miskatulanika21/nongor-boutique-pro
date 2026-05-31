import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, Package, ShoppingBag, CreditCard, Truck, Users, FolderTree, Ticket, FileImage, Boxes, Star, Settings, Search, Bell, ChevronDown, X, Menu, LogOut } from "lucide-react";
import { Logo } from "./Logo";
import { useState, useMemo, type ReactNode } from "react";
import { useAdmin } from "@/store/admin";

const links = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, group: "Overview" },
  { to: "/admin/products", label: "Products", icon: Package, group: "Catalog" },
  { to: "/admin/categories", label: "Categories", icon: FolderTree, group: "Catalog" },
  { to: "/admin/inventory", label: "Inventory", icon: Boxes, group: "Catalog" },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag, group: "Sales" },
  { to: "/admin/payments", label: "Payments", icon: CreditCard, group: "Sales" },
  { to: "/admin/courier", label: "Courier", icon: Truck, group: "Sales" },
  { to: "/admin/customers", label: "Customers", icon: Users, group: "People" },
  { to: "/admin/reviews", label: "Reviews", icon: Star, group: "People" },
  { to: "/admin/coupons", label: "Coupons", icon: Ticket, group: "Marketing" },
  { to: "/admin/content", label: "Content", icon: FileImage, group: "Marketing" },
  { to: "/admin/settings", label: "Settings", icon: Settings, group: "System" },
];

const groups = ["Overview", "Catalog", "Sales", "People", "Marketing", "System"];

export function AdminShell({ children }: { children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const active = links.find((l) => path.startsWith(l.to));
  const { logout, auth } = useAdmin();
  const navigate = useNavigate();

  const adminDisplay = useMemo(() => {
    const email = auth.email || "admin@nongor.com";
    const name = email.split("@")[0];
    const initial = name.charAt(0).toUpperCase();
    const displayName = name.charAt(0).toUpperCase() + name.slice(1);
    return { email, initial, displayName };
  }, [auth.email]);

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/admin/login" });
  };

  const Sidebar = (
    <div className="bg-sidebar text-sidebar-foreground h-full flex flex-col">
      <div className="p-5 flex items-center justify-between border-b border-sidebar-border">
        <Logo dark />
        <button onClick={() => setMobileOpen(false)} className="md:hidden p-1.5 rounded-full hover:bg-sidebar-accent">
          <X className="h-5 w-5" />
        </button>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto scrollbar-none">
        {groups.map((g) => {
          const items = links.filter((l) => l.group === g);
          if (items.length === 0) return null;
          return (
            <div key={g}>
              <div className="px-3 mb-1.5 text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/45 font-semibold">{g}</div>
              <div className="space-y-0.5">
                {items.map((l) => {
                  const isActive = path.startsWith(l.to);
                  return (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setMobileOpen(false)}
                      className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ease-soft ${
                        isActive
                          ? "bg-sidebar-accent text-sidebar-primary font-semibold shadow-soft"
                          : "text-sidebar-foreground/75 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                      }`}
                    >
                      <span className={`relative grid place-items-center h-7 w-7 rounded-md transition ${isActive ? "bg-sidebar-primary/15 text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-foreground"}`}>
                        <l.icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">{l.label}</span>
                      {isActive && <span className="h-1.5 w-1.5 rounded-full bg-sidebar-primary" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Link to="/" className="flex items-center gap-2 text-xs text-sidebar-foreground/65 hover:text-sidebar-primary transition">
          <LogOut className="h-3.5 w-3.5" /> Back to store
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-xs text-sidebar-foreground/65 hover:text-maroon transition w-full text-left bg-transparent border-0 cursor-pointer p-0"
        >
          <LogOut className="h-3.5 w-3.5" /> Log Out
        </button>
        <div className="text-[10px] text-sidebar-foreground/40 font-bengali">নোঙর · Admin</div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/60 flex">
      <aside className="hidden md:block w-64 shrink-0 fixed inset-y-0 left-0 border-r border-sidebar-border">{Sidebar}</aside>
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm animate-fade-up" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 shadow-elegant animate-fade-up">{Sidebar}</aside>
        </div>
      )}
      <div className="flex-1 md:ml-64 min-w-0">
        <header className="bg-ivory/90 backdrop-blur-xl border-b border-hairline sticky top-0 z-30">
          <div className="flex items-center gap-3 px-4 md:px-8 h-16">
            <button className="md:hidden p-2 rounded-full hover:bg-cream" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </button>
            <div className="min-w-0">
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground font-semibold">Admin</div>
              <div className="font-display text-lg leading-tight truncate">{active?.label ?? "Dashboard"}</div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="hidden md:flex items-center bg-cream/60 border border-hairline rounded-full pl-3 pr-2 w-72 transition focus-within:border-gold focus-within:bg-ivory">
                <Search className="h-4 w-4 text-muted-foreground" />
                <input placeholder="Search orders, products…" className="bg-transparent border-0 outline-none h-9 px-2 text-sm flex-1" />
                <kbd className="text-[10px] text-muted-foreground px-1.5 py-0.5 rounded bg-secondary border border-hairline">⌘K</kbd>
              </div>
              <button className="h-10 w-10 grid place-items-center rounded-full hover:bg-cream transition relative" aria-label="Notifications">
                <Bell className="h-4 w-4" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-maroon ring-2 ring-ivory" />
              </button>
              <button className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-cream transition">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-maroon to-maroon-deep text-primary-foreground grid place-items-center text-xs font-semibold shadow-soft">{adminDisplay.initial}</div>
                <div className="hidden md:block text-left leading-tight">
                  <div className="text-xs font-semibold">{adminDisplay.displayName}</div>
                  <div className="text-[10px] text-muted-foreground">Admin</div>
                </div>
                <ChevronDown className="h-3.5 w-3.5 hidden md:block text-muted-foreground" />
              </button>
            </div>
          </div>
          <div className="divider-gold" />
        </header>
        <main className="p-4 md:p-8 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}

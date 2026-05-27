import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Logo } from "./Logo";
import { useShop } from "@/store/shop";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Kurti", search: { collection: "Handmade Kurti" } },
  { to: "/shop", label: "Festive", search: { collection: "Festive Collection" } },
  { to: "/track-order", label: "Track Order" },
];

export function Navbar() {
  const { cartCount, wishlist } = useShop();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="bg-maroon text-primary-foreground text-center text-xs sm:text-sm py-2 px-4">
        <span className="font-bengali mr-2">উৎসব শুরু —</span>
        Free delivery on orders over ৳2,500 · Use code <span className="font-semibold text-gold">NONGOR10</span> for 10% off
      </div>
      <header className="sticky top-0 z-40 bg-ivory/90 backdrop-blur-md border-b border-border">
        <div className="container-narrow flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2 md:gap-8">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="md:hidden p-2 -ml-2"><Menu className="h-5 w-5" /></SheetTrigger>
              <SheetContent side="left" className="w-[80%] bg-ivory">
                <div className="flex items-center justify-between mb-8">
                  <Logo />
                  <button onClick={() => setMobileOpen(false)} className="p-2"><X className="h-5 w-5" /></button>
                </div>
                <nav className="flex flex-col gap-1">
                  {nav.map((n, i) => (
                    <Link key={i} to={n.to} onClick={() => setMobileOpen(false)} className="py-3 px-2 text-base font-medium hover:text-maroon border-b border-border/50">
                      {n.label}
                    </Link>
                  ))}
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="py-3 px-2 text-base">My Account</Link>
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="py-3 px-2 text-base">Wishlist</Link>
                  <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="py-3 px-2 mt-4 text-sm text-muted-foreground">Admin Panel →</Link>
                </nav>
              </SheetContent>
            </Sheet>
            <Logo />
            <nav className="hidden md:flex items-center gap-6">
              {nav.map((n, i) => (
                <Link key={i} to={n.to} className={`text-sm font-medium tracking-wide hover:text-maroon transition-colors ${path === n.to ? "text-maroon" : "text-foreground/80"}`}>
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-1 md:gap-3">
            <div className="hidden lg:flex items-center bg-card border border-border rounded-full px-3 w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search handmade kurti..." className="border-0 bg-transparent focus-visible:ring-0 h-9" />
            </div>
            <button className="lg:hidden p-2"><Search className="h-5 w-5" /></button>
            <Link to="/wishlist" className="p-2 relative hidden sm:block">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && <span className="absolute -top-0.5 -right-0.5 bg-gold text-gold-foreground text-[10px] rounded-full h-4 w-4 grid place-items-center font-semibold">{wishlist.length}</span>}
            </Link>
            <Link to="/cart" className="p-2 relative">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 bg-maroon text-primary-foreground text-[10px] rounded-full h-4 w-4 grid place-items-center font-semibold">{cartCount}</span>}
            </Link>
            <Link to="/account" className="p-2 hidden sm:block"><User className="h-5 w-5" /></Link>
          </div>
        </div>
      </header>
    </>
  );
}

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { cartCount } = useShop();
  const items = [
    { to: "/", icon: "🏠", label: "Home" },
    { to: "/shop", icon: "🛍", label: "Shop" },
    { to: "/wishlist", icon: "♡", label: "Wishlist" },
    { to: "/cart", icon: "🛒", label: "Cart", badge: cartCount },
    { to: "/account", icon: "👤", label: "Account" },
  ] as const;
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-border">
      <div className="grid grid-cols-5 h-16">
        {items.map((it) => {
          const active = path === it.to;
          return (
            <Link key={it.to} to={it.to} className={`flex flex-col items-center justify-center gap-0.5 text-[10px] ${active ? "text-maroon" : "text-muted-foreground"}`}>
              <span className="text-lg relative">
                {it.icon}
                {"badge" in it && it.badge ? <span className="absolute -top-1 -right-3 bg-maroon text-primary-foreground text-[9px] rounded-full h-4 w-4 grid place-items-center">{it.badge}</span> : null}
              </span>
              <span className="font-medium">{it.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

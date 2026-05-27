import { Link, useRouterState } from "@tanstack/react-router";
import { Search, Heart, ShoppingBag, User, Menu, X, Home, Store, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import { useShop } from "@/store/shop";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/shop", label: "Kurti" },
  { to: "/shop", label: "Festive" },
  { to: "/track-order", label: "Track Order" },
];

const marquee = [
  "Free delivery on orders over ৳2,500",
  "Use code NONGOR10 for 10% off",
  "Hand-stitched by women artisans in Bangladesh",
  "Cash on Delivery available nationwide",
];

export function Navbar() {
  const { cartCount, wishlist } = useShop();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-charcoal text-primary-foreground/95 text-[11px] sm:text-xs py-2 overflow-hidden">
        <div className="flex whitespace-nowrap animate-marquee gap-12 px-6">
          {[...marquee, ...marquee].map((m, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className="h-1 w-1 rounded-full bg-gold" />
              {i === 0 && <span className="font-bengali text-gold">উৎসব শুরু —</span>}
              {m}
            </span>
          ))}
        </div>
      </div>

      <header
        className={`sticky top-0 z-40 transition-all duration-300 ease-soft ${
          scrolled
            ? "bg-ivory/85 backdrop-blur-xl border-b border-hairline shadow-soft"
            : "bg-ivory/70 backdrop-blur-md border-b border-transparent"
        }`}
      >
        <div className="container-narrow flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2 md:gap-10">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger className="md:hidden p-2 -ml-2 rounded-full hover:bg-cream transition" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[86%] sm:max-w-sm bg-ivory border-r border-hairline p-0">
                <div className="p-6 flex items-center justify-between border-b border-hairline">
                  <Logo />
                  <button onClick={() => setMobileOpen(false)} className="p-2 rounded-full hover:bg-cream"><X className="h-5 w-5" /></button>
                </div>
                <nav className="p-4 flex flex-col">
                  {nav.map((n, i) => (
                    <Link
                      key={i}
                      to={n.to}
                      onClick={() => setMobileOpen(false)}
                      className="py-3.5 px-3 text-base font-medium text-foreground/85 hover:text-maroon border-b border-hairline/60 transition"
                    >
                      {n.label}
                    </Link>
                  ))}
                  <Link to="/account" onClick={() => setMobileOpen(false)} className="py-3.5 px-3 text-base text-foreground/85 border-b border-hairline/60">My Account</Link>
                  <Link to="/wishlist" onClick={() => setMobileOpen(false)} className="py-3.5 px-3 text-base text-foreground/85 border-b border-hairline/60">Wishlist</Link>
                  <Link to="/admin/dashboard" onClick={() => setMobileOpen(false)} className="py-3.5 px-3 mt-4 text-xs uppercase tracking-[0.25em] text-gold-deep">Admin Panel →</Link>
                </nav>
                <div className="absolute bottom-6 left-6 right-6 text-[11px] text-muted-foreground">
                  <div className="font-bengali text-maroon text-sm">নোঙর</div>
                  Handmade in Bangladesh · Since 2024
                </div>
              </SheetContent>
            </Sheet>
            <Logo />
            <nav className="hidden md:flex items-center gap-7">
              {nav.map((n, i) => (
                <Link
                  key={i}
                  to={n.to}
                  className={`link-elegant text-[13px] font-medium tracking-wide transition-colors ${
                    path === n.to ? "text-maroon" : "text-foreground/75 hover:text-maroon"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className="hidden lg:flex items-center bg-cream/60 border border-hairline rounded-full pl-4 pr-2 w-64 transition focus-within:border-gold focus-within:bg-ivory">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search handmade kurti…" className="border-0 bg-transparent focus-visible:ring-0 h-9 text-sm" />
            </div>
            <button className="lg:hidden p-2.5 rounded-full hover:bg-cream transition" aria-label="Search">
              <Search className="h-5 w-5" />
            </button>
            <Link to="/wishlist" className="p-2.5 rounded-full hover:bg-cream transition relative hidden sm:inline-flex" aria-label="Wishlist">
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 bg-gold text-gold-foreground text-[10px] rounded-full h-4 w-4 grid place-items-center font-semibold shadow-soft">
                  {wishlist.length}
                </span>
              )}
            </Link>
            <Link to="/cart" className="p-2.5 rounded-full hover:bg-cream transition relative" aria-label="Cart">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 bg-maroon text-primary-foreground text-[10px] rounded-full h-4 min-w-4 px-1 grid place-items-center font-semibold shadow-soft animate-fade-up">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link to="/account" className="p-2.5 rounded-full hover:bg-cream transition hidden sm:inline-flex" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <div className="divider-gold" />
      </header>
    </>
  );
}

export function MobileBottomNav() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { cartCount, wishlist } = useShop();
  const items = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/shop", icon: Store, label: "Shop" },
    { to: "/wishlist", icon: Heart, label: "Saved", badge: wishlist.length },
    { to: "/cart", icon: ShoppingBag, label: "Bag", badge: cartCount },
    { to: "/account", icon: User, label: "Account" },
  ] as const;
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 pb-safe">
      <div className="mx-3 mb-3 rounded-2xl bg-ivory/95 backdrop-blur-xl border border-hairline shadow-elegant">
        <div className="grid grid-cols-5 h-16 relative">
          {items.map((it) => {
            const active = path === it.to;
            const Icon = it.icon;
            const badge = "badge" in it ? it.badge : 0;
            return (
              <Link
                key={it.to}
                to={it.to}
                className="flex flex-col items-center justify-center gap-1 text-[10px] relative ease-soft"
              >
                {active && (
                  <span className="absolute top-1.5 h-1 w-8 rounded-full bg-gold animate-fade-up" />
                )}
                <span className={`relative grid place-items-center transition-all duration-300 ${active ? "text-maroon scale-110" : "text-muted-foreground"}`}>
                  <Icon className={`h-[18px] w-[18px] ${active ? "fill-maroon/10" : ""}`} strokeWidth={active ? 2.2 : 1.8} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-maroon text-primary-foreground text-[9px] rounded-full h-4 min-w-4 px-1 grid place-items-center font-semibold">
                      {badge}
                    </span>
                  )}
                </span>
                <span className={`font-medium tracking-wide ${active ? "text-maroon" : "text-muted-foreground"}`}>{it.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

// Sparkles used by some imports
void Sparkles;

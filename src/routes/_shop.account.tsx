import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  User,
  Package,
  MapPin,
  Heart,
  RotateCcw,
  LogOut,
  Clock,
  Shield,
  Settings,
} from "lucide-react";
import { useAdmin } from "@/store/admin";
import { useAuth } from "@/hooks/useAuth";
import { products } from "@/data/mock";
import { taka } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_shop/account")({
  head: () => ({ meta: [{ title: "My Account — Nongor" }] }),
  component: Account,
});

function Account() {
  const { orders } = useAdmin();
  const { isAuthenticated, isLoading, profile, isAdmin, signOut } = useAuth();
  const nav = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      nav({ to: "/login", search: { redirect: "/account" } });
    }
  }, [isLoading, isAuthenticated, nav]);

  if (isLoading) {
    return (
      <div className="container-narrow py-20 text-center">
        <div className="animate-pulse text-muted-foreground text-sm">Loading your account…</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    return null; // Will redirect via useEffect
  }

  const customerName = profile.fullName || profile.email.split("@")[0];
  const customerPhone = profile.phone || "";
  const customerEmail = profile.email;

  // Filter orders matching this customer
  const customerOrders = isAdmin
    ? orders // Admins see all orders
    : orders.filter(
        (o) =>
          (customerPhone &&
            o.phone.replace(/[-\s]/g, "") === customerPhone.replace(/[-\s]/g, "")) ||
          o.customer.toLowerCase().trim() === customerName.toLowerCase().trim(),
      );

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    nav({ to: "/login" });
  };

  return (
    <div className="container-narrow py-10">
      {/* Profile header */}
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gradient-to-br from-maroon to-maroon-deep grid place-items-center text-2xl text-primary-foreground font-display font-semibold shadow-soft">
          {customerName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-3xl font-semibold">
            Welcome back, {customerName.split(" ")[0]}
          </h1>
          <p className="text-sm text-muted-foreground truncate">
            {customerEmail}
            {customerPhone && ` · ${customerPhone}`}
          </p>
        </div>
        {/* Role badge */}
        {isAdmin && (
          <Link
            to="/admin/dashboard"
            className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-maroon to-maroon-deep text-primary-foreground text-xs font-semibold shadow-soft hover:shadow-elegant transition-all hover:-translate-y-0.5"
          >
            <Shield className="h-3.5 w-3.5" />
            Admin Dashboard
          </Link>
        )}
      </div>

      {/* Admin quick-access bar */}
      {isAdmin && (
        <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-cream/80 to-cream/40 border border-gold/15 flex items-center gap-3 sm:hidden">
          <Shield className="h-4 w-4 text-gold-deep shrink-0" />
          <span className="text-xs text-foreground/70 flex-1">
            You're signed in as <span className="font-semibold">Admin</span>
          </span>
          <Link to="/admin/dashboard" className="text-xs font-semibold text-maroon hover:underline">
            Dashboard →
          </Link>
        </div>
      )}

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="bg-cream overflow-x-auto scrollbar-none w-full justify-start border-b border-border/40">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-1.5" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="orders">
            <Package className="h-4 w-4 mr-1.5" />
            My Orders ({customerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="addresses">
            <MapPin className="h-4 w-4 mr-1.5" />
            Addresses
          </TabsTrigger>
          <TabsTrigger value="wishlist">
            <Heart className="h-4 w-4 mr-1.5" />
            Wishlist
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-1.5" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="return">
            <RotateCcw className="h-4 w-4 mr-1.5" />
            Returns
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="profile"
          className="bg-card rounded-2xl p-6 mt-4 border border-border/60"
        >
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              ["Full name", customerName],
              ["Phone number", customerPhone || "Not set"],
              ["Email address", customerEmail],
              ["Role", isAdmin ? "Admin" : "Customer"],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                  {l}
                </div>
                <div className="font-medium text-foreground text-sm flex items-center gap-2">
                  {v}
                  {l === "Role" && isAdmin && <Shield className="h-3.5 w-3.5 text-gold-deep" />}
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => toast.info("Profile editing coming soon")}
            className="mt-6 px-5 py-2 rounded-full bg-maroon text-primary-foreground hover:bg-maroon-deep transition text-xs font-semibold cursor-pointer"
          >
            Edit Profile
          </button>
        </TabsContent>

        <TabsContent value="orders" className="space-y-3 mt-4">
          {customerOrders.map((o) => (
            <div
              key={o.id}
              className="bg-card rounded-2xl p-5 shadow-soft border border-border/40 flex flex-wrap items-center justify-between gap-3 animate-fade-up"
            >
              <div>
                <div className="font-display text-lg text-maroon font-semibold">{o.id}</div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {o.date} · {o.items} item{o.items > 1 && "s"} · {o.payment}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === "Delivered" ? "bg-green-50 text-green-800 border border-green-200" : "bg-cream text-maroon border border-gold/20"}`}
                >
                  {o.status}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                  ({o.paymentStatus})
                </span>
              </div>
              <div className="font-display text-lg font-bold text-foreground">{taka(o.total)}</div>
            </div>
          ))}
          {customerOrders.length === 0 && (
            <div className="p-8 text-center bg-card rounded-2xl text-muted-foreground border border-border/60">
              No orders found yet.{" "}
              <Link to="/shop" className="text-maroon font-semibold hover:underline">
                Start shopping →
              </Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="grid md:grid-cols-2 gap-4 mt-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border border-border/60">
              <div className="font-semibold text-sm">
                {i === 1 ? "Home Delivery Address" : "Office Delivery Address"}
              </div>
              <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                House 12, Road 7, Dhanmondi, Dhaka
              </div>
              <div className="mt-3 flex gap-3 text-xs font-semibold">
                <button
                  onClick={() => toast.info("Address edit coming soon")}
                  className="text-maroon hover:underline cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={() => toast.info("Address delete coming soon")}
                  className="text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="wishlist" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {products.slice(0, 4).map((p) => (
            <div
              key={p.id}
              className="bg-card rounded-xl overflow-hidden shadow-soft border border-border/60 hover:shadow-elegant transition"
            >
              <img src={p.images[0]} className="aspect-[4/5] object-cover w-full" alt="" />
              <div className="p-3">
                <div className="text-xs font-semibold line-clamp-1 text-foreground">{p.name}</div>
                <div className="text-maroon font-display font-bold mt-1 text-sm">
                  {taka(p.discountPrice ?? p.price)}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {products.slice(2, 6).map((p) => (
            <div
              key={p.id}
              className="bg-card rounded-xl overflow-hidden shadow-soft border border-border/60 hover:shadow-elegant transition"
            >
              <img src={p.images[0]} className="aspect-[4/5] object-cover w-full" alt="" />
              <div className="p-3">
                <div className="text-xs font-semibold line-clamp-1 text-foreground">{p.name}</div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent
          value="return"
          className="bg-card rounded-2xl p-6 mt-4 border border-border/60"
        >
          <h3 className="font-display text-lg font-semibold">Request a return / exchange</h3>
          <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
            <input
              placeholder="Order ID (e.g. NGR-1043)"
              className="px-4 py-2.5 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none"
            />
            <select className="px-4 py-2.5 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none cursor-pointer">
              <option>Reason — wrong size</option>
              <option>Damaged on delivery</option>
              <option>Not as described</option>
            </select>
            <textarea
              placeholder="Additional details or comments"
              rows={4}
              className="md:col-span-2 px-4 py-2.5 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none"
            />
          </div>
          <button
            onClick={() => toast.success("Exchange request submitted to review!")}
            className="mt-4 px-5 py-2.5 rounded-full bg-maroon text-primary-foreground hover:bg-maroon-deep transition text-xs font-semibold cursor-pointer"
          >
            Submit Request
          </button>
        </TabsContent>
      </Tabs>

      {/* Sign out */}
      <button
        onClick={handleSignOut}
        className="mt-8 inline-flex items-center gap-2 text-sm text-destructive hover:underline cursor-pointer font-semibold bg-transparent border-0 p-0"
      >
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, MapPin, Heart, RotateCcw, LogOut, Clock, ShieldCheck, Loader2 } from "lucide-react";
import { useAdmin } from "@/store/admin";
import { useAuth } from "@/store/auth";
import { products } from "@/data/mock";
import { taka } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/_shop/account")({
  head: () => ({ meta: [{ title: "My Account — Nongor" }] }),
  component: Account,
});

function Account() {
  const { orders } = useAdmin();
  const { user, loading, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/login", search: { redirect: "/account" } as never, replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated || !user) {
    return (
      <div className="container-narrow py-24 grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-maroon" />
      </div>
    );
  }

  const customerName = user.fullName ?? user.email.split("@")[0];
  const customerPhone = user.phone ?? "—";
  const customerEmail = user.email;

  const customerOrders = orders.filter((o) => {
    if (user.phone) {
      const a = o.phone.replace(/\D/g, "");
      const b = user.phone.replace(/\D/g, "");
      if (a && b && (a.endsWith(b.slice(-9)) || b.endsWith(a.slice(-9)))) return true;
    }
    return o.customer.toLowerCase().trim() === customerName.toLowerCase().trim();
  });

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  };

  return (
    <div className="container-narrow py-10">
      <div className="flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-cream grid place-items-center text-2xl text-maroon font-display font-semibold shadow-soft">
            {customerName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="font-display text-3xl font-semibold">Welcome back, {customerName.split(" ")[0]}</h1>
            <p className="text-sm text-muted-foreground">{customerEmail} · {customerPhone}</p>
          </div>
        </div>
        {user.role === "admin" && (
          <Link to="/admin/dashboard" className="inline-flex items-center gap-2 rounded-full bg-charcoal text-primary-foreground px-4 py-2 text-xs font-semibold tracking-wide hover:bg-charcoal/85 transition">
            <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Open Admin Panel
          </Link>
        )}
      </div>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="bg-cream overflow-x-auto scrollbar-none w-full justify-start border-b border-border/40">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1.5" />Profile</TabsTrigger>
          <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1.5" />My Orders ({customerOrders.length})</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin className="h-4 w-4 mr-1.5" />Addresses</TabsTrigger>
          <TabsTrigger value="wishlist"><Heart className="h-4 w-4 mr-1.5" />Wishlist</TabsTrigger>
          <TabsTrigger value="recent"><Clock className="h-4 w-4 mr-1.5" />Recent</TabsTrigger>
          <TabsTrigger value="return"><RotateCcw className="h-4 w-4 mr-1.5" />Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="bg-card rounded-2xl p-6 mt-4 border border-border/60">
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            {[
              ["Full name", customerName],
              ["Phone number", customerPhone],
              ["Email address", customerEmail],
              ["Account type", user.role === "admin" ? "Admin" : "Customer"],
            ].map(([l, v]) => (
              <div key={l}>
                <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-1">{l}</div>
                <div className="font-medium text-foreground text-sm">{v}</div>
              </div>
            ))}
          </div>
          <button onClick={() => toast.info("Profile editing is coming soon")} className="mt-6 px-5 py-2 rounded-full bg-maroon text-primary-foreground hover:bg-maroon-deep transition text-xs font-semibold cursor-pointer">
            Edit Profile
          </button>
        </TabsContent>

        <TabsContent value="orders" className="space-y-3 mt-4">
          {customerOrders.map((o) => (
            <div key={o.id} className="bg-card rounded-2xl p-5 shadow-soft border border-border/40 flex flex-wrap items-center justify-between gap-3 animate-fade-up">
              <div>
                <div className="font-display text-lg text-maroon font-semibold">{o.id}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{o.date} · {o.items} item{o.items > 1 && "s"} · {o.payment}</div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === "Delivered" ? "bg-green-50 text-green-800 border border-green-200" : "bg-cream text-maroon border border-gold/20"}`}>
                  {o.status}
                </span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">({o.paymentStatus})</span>
              </div>
              <div className="font-display text-lg font-bold text-foreground">{taka(o.total)}</div>
            </div>
          ))}
          {customerOrders.length === 0 && (
            <div className="p-8 text-center bg-card rounded-2xl text-muted-foreground border border-border/60">
              No orders found yet. <Link to="/shop" className="text-maroon font-semibold hover:underline">Start shopping →</Link>
            </div>
          )}
        </TabsContent>

        <TabsContent value="addresses" className="grid md:grid-cols-2 gap-4 mt-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-5 shadow-soft border border-border/60">
              <div className="font-semibold text-sm">{i === 1 ? "Home Delivery Address" : "Office Delivery Address"}</div>
              <div className="text-xs text-muted-foreground mt-1.5 leading-relaxed">House 12, Road 7, Dhanmondi, Dhaka</div>
              <div className="mt-3 flex gap-3 text-xs font-semibold">
                <button onClick={() => toast.info("Address editing coming soon")} className="text-maroon hover:underline cursor-pointer">Edit</button>
                <button onClick={() => toast.info("Address delete coming soon")} className="text-muted-foreground hover:text-destructive cursor-pointer">Delete</button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="wishlist" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="bg-card rounded-xl overflow-hidden shadow-soft border border-border/60 hover:shadow-elegant transition">
              <img src={p.images[0]} className="aspect-[4/5] object-cover w-full" alt="" />
              <div className="p-3">
                <div className="text-xs font-semibold line-clamp-1 text-foreground">{p.name}</div>
                <div className="text-maroon font-display font-bold mt-1 text-sm">{taka(p.discountPrice ?? p.price)}</div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {products.slice(2, 6).map((p) => (
            <div key={p.id} className="bg-card rounded-xl overflow-hidden shadow-soft border border-border/60 hover:shadow-elegant transition">
              <img src={p.images[0]} className="aspect-[4/5] object-cover w-full" alt="" />
              <div className="p-3">
                <div className="text-xs font-semibold line-clamp-1 text-foreground">{p.name}</div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="return" className="bg-card rounded-2xl p-6 mt-4 border border-border/60">
          <h3 className="font-display text-lg font-semibold">Request a return / exchange</h3>
          <p className="mt-1 text-xs text-muted-foreground">Read our <Link to="/return-policy" className="text-maroon underline">Return Policy</Link> before submitting.</p>
          <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
            <input placeholder="Order ID (e.g. NGR-1043)" className="px-4 py-2.5 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none" />
            <select className="px-4 py-2.5 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none cursor-pointer">
              <option>Reason — wrong size</option>
              <option>Damaged on delivery</option>
              <option>Not as described</option>
            </select>
            <textarea placeholder="Additional details or comments" rows={4} className="md:col-span-2 px-4 py-2.5 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none" />
          </div>
          <button onClick={() => toast.success("Exchange request submitted for review")} className="mt-4 px-5 py-2.5 rounded-full bg-maroon text-primary-foreground hover:bg-maroon-deep transition text-xs font-semibold cursor-pointer">
            Submit Request
          </button>
        </TabsContent>
      </Tabs>

      <button onClick={handleSignOut} className="mt-8 inline-flex items-center gap-2 text-sm text-destructive hover:underline cursor-pointer font-semibold">
        <LogOut className="h-4 w-4" /> Sign out
      </button>
    </div>
  );
}

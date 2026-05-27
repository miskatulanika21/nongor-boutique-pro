import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Package, MapPin, Heart, RotateCcw, LogOut, Clock } from "lucide-react";
import { orders, products } from "@/data/mock";
import { taka } from "@/lib/format";

export const Route = createFileRoute("/_shop/account")({
  head: () => ({ meta: [{ title: "My Account — Nongor" }] }),
  component: Account,
});

function Account() {
  return (
    <div className="container-narrow py-10">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-cream grid place-items-center text-2xl text-maroon font-display">T</div>
        <div>
          <h1 className="font-display text-3xl">Welcome back, Tasnim</h1>
          <p className="text-sm text-muted-foreground">tasnim@example.com · 01711-223344</p>
        </div>
      </div>

      <Tabs defaultValue="orders" className="mt-8">
        <TabsList className="bg-cream overflow-x-auto scrollbar-none w-full justify-start">
          <TabsTrigger value="profile"><User className="h-4 w-4 mr-1" />Profile</TabsTrigger>
          <TabsTrigger value="orders"><Package className="h-4 w-4 mr-1" />My Orders</TabsTrigger>
          <TabsTrigger value="addresses"><MapPin className="h-4 w-4 mr-1" />Addresses</TabsTrigger>
          <TabsTrigger value="wishlist"><Heart className="h-4 w-4 mr-1" />Wishlist</TabsTrigger>
          <TabsTrigger value="recent"><Clock className="h-4 w-4 mr-1" />Recent</TabsTrigger>
          <TabsTrigger value="return"><RotateCcw className="h-4 w-4 mr-1" />Returns</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="bg-card rounded-2xl p-6 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[["Full name", "Tasnim Rahman"], ["Phone", "01711-223344"], ["Email", "tasnim@example.com"], ["DOB", "1996-08-12"]].map(([l, v]) => (
              <div key={l}><div className="text-xs text-muted-foreground">{l}</div><div className="font-medium">{v}</div></div>
            ))}
          </div>
          <button className="mt-6 px-5 py-2 rounded-full bg-maroon text-primary-foreground text-sm">Edit Profile</button>
        </TabsContent>

        <TabsContent value="orders" className="space-y-3 mt-4">
          {orders.slice(0, 4).map((o) => (
            <div key={o.id} className="bg-card rounded-2xl p-5 shadow-soft flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-display text-lg text-maroon">{o.id}</div>
                <div className="text-xs text-muted-foreground">{o.date} · {o.items} item{o.items > 1 && "s"}</div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${o.status === "Delivered" ? "bg-green-100 text-green-800" : "bg-cream text-maroon"}`}>{o.status}</span>
              <div className="font-display text-lg">{taka(o.total)}</div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="addresses" className="grid md:grid-cols-2 gap-4 mt-4">
          {[1, 2].map((i) => (
            <div key={i} className="bg-card rounded-2xl p-5 shadow-soft">
              <div className="font-semibold">{i === 1 ? "Home" : "Office"}</div>
              <div className="text-sm text-muted-foreground mt-1">House 12, Road 7, Dhanmondi, Dhaka</div>
              <div className="mt-3 flex gap-2 text-xs">
                <button className="text-maroon font-semibold">Edit</button>
                <button className="text-muted-foreground">Delete</button>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="wishlist" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {products.slice(0, 4).map((p) => (
            <div key={p.id} className="bg-card rounded-xl overflow-hidden shadow-soft">
              <img src={p.images[0]} className="aspect-[4/5] object-cover w-full" alt="" />
              <div className="p-3"><div className="text-sm font-medium line-clamp-1">{p.name}</div><div className="text-maroon font-display">{taka(p.discountPrice ?? p.price)}</div></div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="recent" className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {products.slice(2, 6).map((p) => (
            <div key={p.id} className="bg-card rounded-xl overflow-hidden shadow-soft">
              <img src={p.images[0]} className="aspect-[4/5] object-cover w-full" alt="" />
              <div className="p-3"><div className="text-sm font-medium line-clamp-1">{p.name}</div></div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="return" className="bg-card rounded-2xl p-6 mt-4">
          <h3 className="font-display text-xl">Request a return / exchange</h3>
          <div className="mt-4 grid md:grid-cols-2 gap-4">
            <input placeholder="Order ID" className="px-4 py-2.5 rounded-lg bg-secondary text-sm" />
            <select className="px-4 py-2.5 rounded-lg bg-secondary text-sm"><option>Reason — wrong size</option><option>Damaged</option><option>Not as described</option></select>
            <textarea placeholder="Additional details" rows={4} className="md:col-span-2 px-4 py-2.5 rounded-lg bg-secondary text-sm" />
          </div>
          <button className="mt-4 px-5 py-2 rounded-full bg-maroon text-primary-foreground text-sm">Submit Request</button>
        </TabsContent>
      </Tabs>

      <button className="mt-8 inline-flex items-center gap-2 text-sm text-destructive"><LogOut className="h-4 w-4" /> Sign out</button>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/settings")({ component: Page });

function Page() {
  return (
    <div>
      <PageHeader title="Store Settings" />
      <Tabs defaultValue="store">
        <TabsList className="bg-card overflow-x-auto w-full justify-start">
          <TabsTrigger value="store">Store</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="notify">Notifications</TabsTrigger>
        </TabsList>
        <TabsContent value="store" className="bg-card rounded-xl p-6 mt-4 grid md:grid-cols-2 gap-4 text-sm">
          {[["Store Name", "Nongor"], ["Contact Number", "+880 1700-000000"], ["Email", "hello@nongor.com.bd"], ["Address", "Dhanmondi, Dhaka"], ["Facebook", "facebook.com/nongor"], ["Instagram", "@nongor.bd"], ["TikTok", "@nongor"], ["WhatsApp", "+880 1700-000000"]].map(([l, v]) => (
            <div key={l}><label className="text-xs text-muted-foreground">{l}</label><input defaultValue={v} className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary" /></div>
          ))}
          <div className="md:col-span-2"><label className="text-xs text-muted-foreground">Logo</label><div className="mt-1 border-2 border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground">Upload logo</div></div>
        </TabsContent>
        <TabsContent value="delivery" className="bg-card rounded-xl p-6 mt-4 text-sm space-y-4">
          <div><label className="text-xs text-muted-foreground">Delivery charge (Inside Dhaka)</label><input defaultValue="60" className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary" /></div>
          <div><label className="text-xs text-muted-foreground">Delivery charge (Outside Dhaka)</label><input defaultValue="120" className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary" /></div>
          <div><label className="text-xs text-muted-foreground">Free delivery threshold</label><input defaultValue="2500" className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary" /></div>
        </TabsContent>
        <TabsContent value="payment" className="bg-card rounded-xl p-6 mt-4 space-y-3">
          {["Cash on Delivery", "bKash Manual", "Nagad Manual", "Rocket Manual", "Card (SSLCommerz)", "ShurjoPay"].map((m) => (
            <label key={m} className="flex items-center justify-between p-3 rounded-lg bg-secondary"><span className="font-medium text-sm">{m}</span><input type="checkbox" defaultChecked className="accent-maroon h-4 w-4" /></label>
          ))}
        </TabsContent>
        <TabsContent value="policies" className="bg-card rounded-xl p-6 mt-4 space-y-4 text-sm">
          {["Return Policy", "Privacy Policy", "FAQ"].map((t) => (
            <div key={t}><label className="font-semibold">{t}</label><textarea rows={4} className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary" defaultValue={`${t} content...`} /></div>
          ))}
        </TabsContent>
        <TabsContent value="notify" className="bg-card rounded-xl p-6 mt-4 space-y-3">
          {["Email alert for new order", "SMS alert for new order", "Customer order confirmation SMS"].map((m) => (
            <label key={m} className="flex items-center justify-between p-3 rounded-lg bg-secondary"><span className="font-medium text-sm">{m}</span><input type="checkbox" defaultChecked className="accent-maroon h-4 w-4" /></label>
          ))}
        </TabsContent>
      </Tabs>
      <div className="mt-6"><button className="bg-maroon text-primary-foreground rounded-lg px-6 py-2.5 text-sm font-semibold">Save Changes</button></div>
    </div>
  );
}

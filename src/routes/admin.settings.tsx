import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/ui";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdmin } from "@/store/admin";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/settings")({
  head: () => ({ meta: [{ title: "Store Settings — Admin" }] }),
  component: Page,
});

function Page() {
  const { settings, updateSetting } = useAdmin();

  // Controlled states initially loaded from store settings
  const [storeName, setStoreName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");

  const [deliveryInsideDhaka, setDeliveryInsideDhaka] = useState("");
  const [deliveryOutsideDhaka, setDeliveryOutsideDhaka] = useState("");
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState("");

  const [enableCOD, setEnableCOD] = useState(true);
  const [enableBkash, setEnableBkash] = useState(true);
  const [enableNagad, setEnableNagad] = useState(true);
  const [enableRocket, setEnableRocket] = useState(true);
  const [enableCard, setEnableCard] = useState(true);
  const [enableShurjoPay, setEnableShurjoPay] = useState(true);

  const [emailAlertNewOrder, setEmailAlertNewOrder] = useState(true);
  const [smsAlertNewOrder, setSmsAlertNewOrder] = useState(true);
  const [customerConfirmSms, setCustomerConfirmSms] = useState(true);

  // Sync state with store values upon mount/change
  useEffect(() => {
    if (settings) {
      setStoreName(settings.storeName || "Nongor");
      setContactNumber(settings.contactNumber || "+880 1700-000000");
      setEmail(settings.email || "hello@nongor.com.bd");
      setAddress(settings.address || "Dhanmondi, Dhaka");

      setDeliveryInsideDhaka(settings.deliveryInsideDhaka || "60");
      setDeliveryOutsideDhaka(settings.deliveryOutsideDhaka || "120");
      setFreeDeliveryThreshold(settings.freeDeliveryThreshold || "2500");

      setEnableCOD(settings.enableCOD !== "false");
      setEnableBkash(settings.enableBkash !== "false");
      setEnableNagad(settings.enableNagad !== "false");
      setEnableRocket(settings.enableRocket !== "false");
      setEnableCard(settings.enableCard !== "false");
      setEnableShurjoPay(settings.enableShurjoPay !== "false");

      setEmailAlertNewOrder(settings.emailAlertNewOrder !== "false");
      setSmsAlertNewOrder(settings.smsAlertNewOrder !== "false");
      setCustomerConfirmSms(settings.customerConfirmSms !== "false");
    }
  }, [settings]);

  const handleSaveChanges = () => {
    updateSetting("storeName", storeName);
    updateSetting("contactNumber", contactNumber);
    updateSetting("email", email);
    updateSetting("address", address);

    updateSetting("deliveryInsideDhaka", deliveryInsideDhaka);
    updateSetting("deliveryOutsideDhaka", deliveryOutsideDhaka);
    updateSetting("freeDeliveryThreshold", freeDeliveryThreshold);

    updateSetting("enableCOD", String(enableCOD));
    updateSetting("enableBkash", String(enableBkash));
    updateSetting("enableNagad", String(enableNagad));
    updateSetting("enableRocket", String(enableRocket));
    updateSetting("enableCard", String(enableCard));
    updateSetting("enableShurjoPay", String(enableShurjoPay));

    updateSetting("emailAlertNewOrder", String(emailAlertNewOrder));
    updateSetting("smsAlertNewOrder", String(smsAlertNewOrder));
    updateSetting("customerConfirmSms", String(customerConfirmSms));

    toast.success("Store settings updated successfully!");
  };

  return (
    <div>
      <PageHeader title="Store Settings" subtitle="Configure system rules and delivery settings" />
      <Tabs defaultValue="store">
        <TabsList className="bg-card overflow-x-auto w-full justify-start border-b border-border/40">
          <TabsTrigger value="store">Store Details</TabsTrigger>
          <TabsTrigger value="delivery">Delivery</TabsTrigger>
          <TabsTrigger value="payment">Payment Options</TabsTrigger>
          <TabsTrigger value="notify">Notifications</TabsTrigger>
        </TabsList>

        {/* Store details */}
        <TabsContent
          value="store"
          className="bg-card rounded-xl p-6 mt-4 grid md:grid-cols-2 gap-4 text-sm border border-border/60"
        >
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Store Name
            </label>
            <input
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-secondary outline-none border border-transparent focus:border-maroon transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Contact Number
            </label>
            <input
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-secondary outline-none border border-transparent focus:border-maroon transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Email Address
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-secondary outline-none border border-transparent focus:border-maroon transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Store Physical Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-secondary outline-none border border-transparent focus:border-maroon transition"
            />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Store Branding Logo
            </label>
            <div className="mt-1.5 border-2 border-dashed border-border rounded-lg p-6 text-center text-sm text-muted-foreground bg-secondary/30">
              Upload logo (Admin demo placeholder)
            </div>
          </div>
        </TabsContent>

        {/* Delivery settings */}
        <TabsContent
          value="delivery"
          className="bg-card rounded-xl p-6 mt-4 text-sm space-y-4 border border-border/60"
        >
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Delivery Charge (Inside Dhaka)
            </label>
            <input
              value={deliveryInsideDhaka}
              onChange={(e) => setDeliveryInsideDhaka(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-secondary outline-none border border-transparent focus:border-maroon transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Delivery Charge (Outside Dhaka)
            </label>
            <input
              value={deliveryOutsideDhaka}
              onChange={(e) => setDeliveryOutsideDhaka(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-secondary outline-none border border-transparent focus:border-maroon transition"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Free Delivery Order Threshold
            </label>
            <input
              value={freeDeliveryThreshold}
              onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
              className="mt-1.5 w-full px-3 py-2.5 rounded-lg bg-secondary outline-none border border-transparent focus:border-maroon transition"
            />
          </div>
        </TabsContent>

        {/* Payment Gateways toggles */}
        <TabsContent
          value="payment"
          className="bg-card rounded-xl p-6 mt-4 space-y-3 border border-border/60"
        >
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <div>
              <span className="font-semibold text-sm">Cash on Delivery (COD)</span>
              <div className="text-[11px] text-muted-foreground">
                Pay with cash upon package hand over
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableCOD}
              onChange={(e) => setEnableCOD(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <div>
              <span className="font-semibold text-sm">bKash Merchant Pay</span>
              <div className="text-[11px] text-muted-foreground">
                Manual transfer verification gateway
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableBkash}
              onChange={(e) => setEnableBkash(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <div>
              <span className="font-semibold text-sm">Nagad Personal Pay</span>
              <div className="text-[11px] text-muted-foreground">
                Manual transfer verification gateway
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableNagad}
              onChange={(e) => setEnableNagad(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <div>
              <span className="font-semibold text-sm">Rocket Merchant Pay</span>
              <div className="text-[11px] text-muted-foreground">
                Manual transfer verification gateway
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableRocket}
              onChange={(e) => setEnableRocket(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <div>
              <span className="font-semibold text-sm">Card (SSLCommerz gateway)</span>
              <div className="text-[11px] text-muted-foreground">
                Direct online Visa, MasterCard secure channel
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableCard}
              onChange={(e) => setEnableCard(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <div>
              <span className="font-semibold text-sm">ShurjoPay</span>
              <div className="text-[11px] text-muted-foreground">
                Local online banking secure channel
              </div>
            </div>
            <input
              type="checkbox"
              checked={enableShurjoPay}
              onChange={(e) => setEnableShurjoPay(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
        </TabsContent>

        {/* Notifications */}
        <TabsContent
          value="notify"
          className="bg-card rounded-xl p-6 mt-4 space-y-3 border border-border/60"
        >
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <span className="font-semibold text-sm">Email alert for new order placement</span>
            <input
              type="checkbox"
              checked={emailAlertNewOrder}
              onChange={(e) => setEmailAlertNewOrder(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <span className="font-semibold text-sm">SMS alert for new order placement</span>
            <input
              type="checkbox"
              checked={smsAlertNewOrder}
              onChange={(e) => setSmsAlertNewOrder(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
          <label className="flex items-center justify-between p-3.5 rounded-lg bg-secondary/60 cursor-pointer">
            <span className="font-semibold text-sm">
              Customer automatic confirmation receipt SMS
            </span>
            <input
              type="checkbox"
              checked={customerConfirmSms}
              onChange={(e) => setCustomerConfirmSms(e.target.checked)}
              className="accent-maroon h-4 w-4 cursor-pointer"
            />
          </label>
        </TabsContent>
      </Tabs>
      <div className="mt-6">
        <button
          onClick={handleSaveChanges}
          className="bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-lg px-6 py-3 text-sm font-semibold cursor-pointer transition shadow-soft"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

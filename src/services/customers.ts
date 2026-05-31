/**
 * Customers service — fetches and calculates customer statistics from profiles and orders in Supabase
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { customers as mockCustomers } from "@/data/mock";

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpend: number;
  lastOrder: string;
  status: "Active" | "Flagged";
};

export async function getAllCustomers(): Promise<Customer[]> {
  if (!isSupabaseConfigured) {
    return mockCustomers;
  }

  try {
    // 1. Fetch profiles
    const { data: profiles, error: pError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (pError) throw pError;

    // 2. Fetch order metrics grouped by customer phone/email
    const { data: orders, error: oError } = await supabase
      .from("orders")
      .select(
        "customer_name, customer_phone, customer_email, total_amount, created_at, order_status",
      );

    if (oError) throw oError;

    // Map profiles as base
    const customerMap = new Map<string, Customer>();

    (profiles ?? []).forEach((p) => {
      customerMap.set(p.id, {
        id: p.id,
        name: p.full_name || "No Name",
        phone: p.phone || "",
        email: "", // profiles don't contain email, but we can search orders or fallback
        totalOrders: 0,
        totalSpend: 0,
        lastOrder: p.created_at ? p.created_at.slice(0, 10) : "N/A",
        status: "Active",
      });
    });

    // Populate order metrics
    (orders ?? []).forEach((o) => {
      // Find matching customer by phone
      const phoneClean = o.customer_phone?.replace(/[-\s]/g, "");
      let foundCust = Array.from(customerMap.values()).find(
        (c) => c.phone && c.phone.replace(/[-\s]/g, "") === phoneClean,
      );

      if (!foundCust) {
        // If not a registered profile, create an guest/unregistered customer entry
        const guestId = `guest-${phoneClean || o.customer_name}`;
        if (!customerMap.has(guestId)) {
          customerMap.set(guestId, {
            id: guestId,
            name: o.customer_name || "Guest Customer",
            phone: o.customer_phone || "",
            email: o.customer_email || "N/A",
            totalOrders: 0,
            totalSpend: 0,
            lastOrder: o.created_at ? o.created_at.slice(0, 10) : "N/A",
            status: "Active",
          });
        }
        foundCust = customerMap.get(guestId)!;
      }

      if (o.customer_email && foundCust.email === "N/A") {
        foundCust.email = o.customer_email;
      }

      if (o.order_status !== "cancelled") {
        foundCust.totalOrders += 1;
        foundCust.totalSpend += o.total_amount || 0;

        const oDate = o.created_at ? o.created_at.slice(0, 10) : "";
        if (oDate && (foundCust.lastOrder === "N/A" || oDate > foundCust.lastOrder)) {
          foundCust.lastOrder = oDate;
        }
      }
    });

    const result = Array.from(customerMap.values());
    if (result.length === 0) {
      // If database contains 0 customers but is configured, return empty
      return [];
    }
    return result;
  } catch (err) {
    console.error("[customers] getAllCustomers error:", err);
    return mockCustomers;
  }
}

/**
 * Orders service — Supabase RPC for order creation, admin management
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { DbOrder, OrderItem } from "@/lib/database.types";
import type { Json } from "@/lib/database.types";
import { products as mockProducts, orders as mockOrders } from "@/data/mock";

// A helper helper to normalize phone numbers for comparison
function normalizePhone(p: string): string {
  return p.replace(/[-+\s()]/g, "");
}

// ─── Types ─────────────────────────────────────────────────

export type CreateOrderPayload = {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  district: string;
  upazila: string;
  fullAddress: string;
  deliveryNote?: string;
  paymentMethod: string;
  trxId?: string;
  subtotal: number;
  discountAmount?: number;
  deliveryCharge?: number;
  totalAmount: number;
  couponCode?: string;
  items: {
    productId: string;
    variantId?: string;
    productName: string;
    size: string;
    color: string;
    quantity: number;
    unitPrice: number;
  }[];
};

export type OrderWithItems = DbOrder & {
  items?: OrderItem[];
};

// ─── Public / Customer ─────────────────────────────────────

/** Create order via atomic RPC function */
export async function createOrder(payload: CreateOrderPayload): Promise<{
  success: boolean;
  orderNumber?: string;
  orderId?: string;
  error?: string;
}> {
  const isUuid = (id: string) =>
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
  const hasMockIds = payload.items.some((i) => !isUuid(i.productId));

  if (!isSupabaseConfigured || hasMockIds) {
    // Generate a random order number like NGR-1043
    const orderNumber = `NGR-${Math.floor(1043 + Math.random() * 9000)}`;
    const orderId = `mock-order-${Math.floor(100000 + Math.random() * 900000)}`;

    // Save order to localStorage so it can be queried/tracked later
    try {
      if (typeof window !== "undefined") {
        const existing = localStorage.getItem("nongor_mock_orders");
        const list = existing ? JSON.parse(existing) : [];
        list.push({
          id: orderId,
          order_number: orderNumber,
          customer_name: payload.customerName,
          customer_phone: payload.customerPhone,
          order_status: "pending",
          payment_method: payload.paymentMethod.toLowerCase(),
          payment_status: "pending",
          total_amount: payload.totalAmount,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem("nongor_mock_orders", JSON.stringify(list));
      }
    } catch (e) {
      console.warn("Failed to save mock order to localStorage:", e);
    }

    return {
      success: true,
      orderNumber,
      orderId,
    };
  }

  const items: Json = payload.items.map((i) => ({
    product_id: i.productId,
    variant_id: i.variantId ?? null,
    product_name: i.productName,
    size: i.size,
    color: i.color,
    quantity: i.quantity,
    unit_price: i.unitPrice,
  }));

  const { data, error } = await supabase.rpc("create_order_with_items", {
    p_customer_name: payload.customerName,
    p_customer_phone: payload.customerPhone,
    p_customer_email: payload.customerEmail,
    p_district: payload.district,
    p_upazila: payload.upazila,
    p_full_address: payload.fullAddress,
    p_delivery_note: payload.deliveryNote,
    p_payment_method: payload.paymentMethod.toLowerCase(),
    p_trx_id: payload.trxId,
    p_subtotal: payload.subtotal,
    p_discount_amount: payload.discountAmount ?? 0,
    p_delivery_charge: payload.deliveryCharge ?? 0,
    p_total_amount: payload.totalAmount,
    p_coupon_code: payload.couponCode,
    p_items: items,
  });

  if (error) {
    console.error("[orders] createOrder error:", error);
    return { success: false, error: error.message };
  }

  const result = data as { order_id: string; order_number: string } | null;
  return {
    success: true,
    orderId: result?.order_id,
    orderNumber: result?.order_number,
  };
}

/** Track order by order number + phone (public, no auth needed) */
export async function trackOrder(
  orderNumber: string,
  phone: string,
): Promise<{
  found: boolean;
  order?: Record<string, unknown>;
}> {
  const normPhoneInput = normalizePhone(phone);

  // Check custom mock orders in localStorage
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem("nongor_mock_orders");
      const list: Record<string, unknown>[] = existing ? JSON.parse(existing) : [];
      const foundLocal = list.find(
        (o) =>
          o.order_number === orderNumber &&
          normalizePhone((o.customer_phone as string) ?? "") === normPhoneInput,
      );
      if (foundLocal) {
        return { found: true, order: foundLocal };
      }
    } catch (e) {
      console.warn("Failed to read mock orders from localStorage:", e);
    }
  }

  // Fallback to default mock list in mock.ts
  const foundMock = mockOrders.find(
    (o) => o.id === orderNumber && normalizePhone(o.phone) === normPhoneInput,
  );
  if (foundMock) {
    return {
      found: true,
      order: {
        id: foundMock.id,
        order_number: foundMock.id,
        customer_name: foundMock.customer,
        customer_phone: foundMock.phone,
        order_status: foundMock.status.toLowerCase(),
        payment_method: foundMock.payment.toLowerCase(),
        payment_status: foundMock.paymentStatus.toLowerCase(),
        total_amount: foundMock.total,
        created_at: new Date().toISOString(),
        courier_name: foundMock.courier,
        tracking_id: foundMock.trackingId,
      },
    };
  }

  if (!isSupabaseConfigured) return { found: false };

  const { data, error } = await supabase.rpc("track_order", {
    p_order_number: orderNumber,
    p_phone: phone,
  });

  if (error) {
    console.error("[orders] trackOrder error:", error);
    return { found: false };
  }

  const result = data as Record<string, unknown> | null;
  if (!result || result.found === false) return { found: false };
  return { found: true, order: result };
}

/** Get orders for current authenticated user */
export async function getMyOrders(): Promise<OrderWithItems[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] getMyOrders error:", error);
    return [];
  }

  return (data ?? []) as OrderWithItems[];
}

// ─── Admin ─────────────────────────────────────────────────

/** Get all orders (admin) */
export async function adminGetAllOrders(): Promise<OrderWithItems[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("orders")
    .select("*, items:order_items(*), address:addresses(district), payments:payments(trx_id)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[orders] adminGetAllOrders error:", error);
    return [];
  }

  return (data ?? []) as unknown as OrderWithItems[];
}

/** Update order status (admin) */
export async function adminUpdateOrderStatus(
  orderId: string,
  status: DbOrder["order_status"],
): Promise<boolean> {
  const { error } = await supabase
    .from("orders")
    .update({ order_status: status })
    .eq("id", orderId);

  if (error) {
    console.error("[orders] updateStatus error:", error);
    return false;
  }
  return true;
}

/** Update order fields (admin) */
export async function adminUpdateOrder(
  orderId: string,
  patch: Partial<Pick<DbOrder, "order_status" | "courier_name" | "tracking_id" | "admin_note">>,
): Promise<boolean> {
  const { error } = await supabase.from("orders").update(patch).eq("id", orderId);

  if (error) {
    console.error("[orders] adminUpdateOrder error:", error);
    return false;
  }
  return true;
}

/** Get dashboard stats */
export async function adminGetOrderStats(): Promise<{
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  todayOrders: number;
}> {
  if (!isSupabaseConfigured) {
    return { totalOrders: 0, pendingOrders: 0, totalRevenue: 0, todayOrders: 0 };
  }

  const today = new Date().toISOString().slice(0, 10);

  const [allOrders, pendingOrders, todayOrders] = await Promise.all([
    supabase.from("orders").select("total_amount", { count: "exact" }),
    supabase.from("orders").select("id", { count: "exact" }).eq("order_status", "pending"),
    supabase.from("orders").select("id", { count: "exact" }).gte("created_at", today),
  ]);

  const totalRevenue = (allOrders.data ?? []).reduce((sum, o) => sum + (o.total_amount ?? 0), 0);

  return {
    totalOrders: allOrders.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
    totalRevenue,
    todayOrders: todayOrders.count ?? 0,
  };
}

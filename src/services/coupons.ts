/**
 * Coupons service — validate + admin CRUD
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Coupon, InsertTables, UpdateTables } from "@/lib/database.types";
import { coupons as mockCoupons } from "@/data/mock";

/** Validate a coupon code against order total */
export async function validateCoupon(
  code: string,
  orderTotal: number,
): Promise<{
  valid: boolean;
  coupon?: Coupon;
  discount?: number;
  error?: string;
}> {
  if (!isSupabaseConfigured) {
    // Mock fallback
    const m = mockCoupons.find((c) => c.code === code && c.active);
    if (!m) return { valid: false, error: "Invalid or expired coupon code" };
    if (orderTotal < m.minOrder)
      return { valid: false, error: `Minimum order ৳${m.minOrder} required` };
    const discount = m.type === "Percentage" ? Math.round((orderTotal * m.value) / 100) : m.value;
    return { valid: true, discount };
  }

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single();

  if (error || !data) return { valid: false, error: "Invalid or expired coupon code" };

  const coupon = data as Coupon;

  // Check expiry
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: "This coupon has expired" };
  }

  // Check start date
  if (coupon.starts_at && new Date(coupon.starts_at) > new Date()) {
    return { valid: false, error: "This coupon is not active yet" };
  }

  // Check minimum order
  if (orderTotal < coupon.minimum_order) {
    return { valid: false, error: `Minimum order ৳${coupon.minimum_order} required` };
  }

  // Check usage limit
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, error: "This coupon has reached its usage limit" };
  }

  // Calculate discount
  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round((orderTotal * coupon.value) / 100);
  } else if (coupon.type === "flat") {
    discount = coupon.value;
  }
  // free_delivery is handled by setting delivery charge to 0

  return { valid: true, coupon, discount };
}

// ─── Admin CRUD ────────────────────────────────────────────

export async function adminGetAllCoupons(): Promise<Coupon[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[coupons] adminGetAll error:", error);
    return [];
  }
  return data ?? [];
}

export async function adminCreateCoupon(coupon: InsertTables<"coupons">): Promise<Coupon | null> {
  const { data, error } = await supabase.from("coupons").insert(coupon).select().single();

  if (error) {
    console.error("[coupons] create error:", error);
    return null;
  }
  return data;
}

export async function adminUpdateCoupon(
  id: string,
  patch: UpdateTables<"coupons">,
): Promise<Coupon | null> {
  const { data, error } = await supabase
    .from("coupons")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[coupons] update error:", error);
    return null;
  }
  return data;
}

export async function adminDeleteCoupon(id: string): Promise<boolean> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) {
    console.error("[coupons] delete error:", error);
    return false;
  }
  return true;
}

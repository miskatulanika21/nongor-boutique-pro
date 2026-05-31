/**
 * Settings service — site_settings table
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

const DEFAULT_SETTINGS: Record<string, string> = {
  storeName: "Nongor",
  contactNumber: "+880 1700-000000",
  email: "hello@nongor.com.bd",
  address: "Dhanmondi, Dhaka",
  deliveryInsideDhaka: "60",
  deliveryOutsideDhaka: "120",
  freeDeliveryThreshold: "2500",
  enableCOD: "true",
  enableBkash: "true",
  enableNagad: "true",
  enableRocket: "true",
  enableCard: "true",
  enableShurjoPay: "true",
  emailAlertNewOrder: "true",
  smsAlertNewOrder: "true",
  customerConfirmSms: "true",
};

/** Fetch all settings as a flat key-value map */
export async function getSettings(): Promise<Record<string, string>> {
  if (!isSupabaseConfigured) return { ...DEFAULT_SETTINGS };

  const { data, error } = await supabase.from("site_settings").select("key, value");

  if (error || !data) {
    console.error("[settings] getSettings error:", error);
    return { ...DEFAULT_SETTINGS };
  }

  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of data) {
    // value is stored as JSONB — unwrap the JSON string
    const raw = row.value;
    settings[row.key] = typeof raw === "string" ? raw : JSON.stringify(raw);
  }
  return settings;
}

/** Get a single setting value */
export async function getSetting(key: string): Promise<string> {
  if (!isSupabaseConfigured) return DEFAULT_SETTINGS[key] ?? "";

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", key)
    .single();

  if (error || !data) return DEFAULT_SETTINGS[key] ?? "";
  const raw = data.value;
  return typeof raw === "string" ? raw : JSON.stringify(raw);
}

/** Update a single setting (admin) */
export async function adminUpdateSetting(key: string, value: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase
    .from("site_settings")
    .upsert({ key, value: JSON.parse(JSON.stringify(value)) }, { onConflict: "key" });

  if (error) {
    console.error("[settings] update error:", error);
    return false;
  }
  return true;
}

/** Bulk update settings (admin) */
export async function adminUpdateSettings(updates: Record<string, string>): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const rows = Object.entries(updates).map(([key, value]) => ({
    key,
    value: JSON.parse(JSON.stringify(value)),
  }));

  const { error } = await supabase.from("site_settings").upsert(rows, { onConflict: "key" });

  if (error) {
    console.error("[settings] bulkUpdate error:", error);
    return false;
  }
  return true;
}

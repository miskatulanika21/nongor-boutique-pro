/**
 * Categories service — fetches from Supabase with mock fallback
 */
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { Category, InsertTables, UpdateTables } from "@/lib/database.types";
import { categories as mockCategories } from "@/data/mock";

// ─── Public ────────────────────────────────────────────────

export async function getActiveCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) {
    return mockCategories.filter((c) => c.status === "Active").map(mockToCategory);
  }

  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) {
    console.error("[categories] getActiveCategories error:", error);
    return mockCategories.filter((c) => c.status === "Active").map(mockToCategory);
  }

  return data ?? [];
}

// ─── Admin ─────────────────────────────────────────────────

export async function adminGetAllCategories(): Promise<Category[]> {
  if (!isSupabaseConfigured) return mockCategories.map(mockToCategory);

  const { data, error } = await supabase.from("categories").select("*").order("sort_order");

  if (error) {
    console.error("[categories] adminGetAll error:", error);
    return mockCategories.map(mockToCategory);
  }

  return data ?? [];
}

export async function adminCreateCategory(
  cat: InsertTables<"categories">,
): Promise<Category | null> {
  const { data, error } = await supabase.from("categories").insert(cat).select().single();

  if (error) {
    console.error("[categories] create error:", error);
    return null;
  }
  return data;
}

export async function adminUpdateCategory(
  id: string,
  patch: UpdateTables<"categories">,
): Promise<Category | null> {
  const { data, error } = await supabase
    .from("categories")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("[categories] update error:", error);
    return null;
  }
  return data;
}

export async function adminDeleteCategory(id: string): Promise<boolean> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) {
    console.error("[categories] delete error:", error);
    return false;
  }
  return true;
}

// ─── Mock adapter ──────────────────────────────────────────

function mockToCategory(m: (typeof mockCategories)[number]): Category {
  return {
    id: m.id,
    name: m.name,
    slug: m.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    description: null,
    image_url: m.image,
    is_active: m.status === "Active",
    sort_order: 0,
    created_at: new Date().toISOString(),
  };
}

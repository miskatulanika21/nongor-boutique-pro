import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import {
  products as defaultProducts,
  orders as defaultOrders,
  coupons as defaultCoupons,
  type Product,
  type Order,
} from "@/data/mock";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { adminGetAllProducts } from "@/services/products";
import { adminGetAllOrders } from "@/services/orders";
import { approvePayment as approvePaymentService, rejectPayment as rejectPaymentService } from "@/services/payments";
import { adminGetAllCoupons } from "@/services/coupons";
import { getSettings, adminUpdateSetting } from "@/services/settings";
import { toMockProducts } from "@/lib/product-adapter";

/* ──────────────────────────── Types ──────────────────────────── */

export type Coupon = {
  code: string;
  type: string;
  value: number;
  minOrder: number;
  expiry: string;
  uses: number;
  active: boolean;
};

export type AdminAuth = { isAdmin: boolean; email: string; userId?: string };

export type AdminState = {
  /* auth */
  auth: AdminAuth;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  authLoading: boolean;

  /* products */
  products: Product[];
  addProduct: (p: Product) => Promise<void>;
  updateProduct: (id: string, patch: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  /* orders */
  orders: Order[];
  addOrder: (o: Order) => void;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;

  /* payments */
  approvePayment: (id: string) => Promise<void>;
  rejectPayment: (id: string) => Promise<void>;
  resetPayment: (id: string) => Promise<void>;

  /* coupons */
  coupons: Coupon[];
  addCoupon: (c: Coupon) => Promise<void>;
  updateCoupon: (code: string, patch: Partial<Coupon>) => Promise<void>;
  deleteCoupon: (code: string) => Promise<void>;

  /* settings */
  settings: Record<string, string>;
  updateSetting: (key: string, value: string) => Promise<void>;
};

/* ──────────────────────────── Helpers ──────────────────────────── */

const isBrowser = typeof window !== "undefined";

function load<T>(key: string, fallback: T): T {
  if (!isBrowser) return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown) {
  if (isBrowser) localStorage.setItem(key, JSON.stringify(value));
}

function toMockOrder(o: any): Order {
  let paymentStatus: Order["paymentStatus"] = "Pending";
  if (o.payment_method === 'cod') {
    paymentStatus = "COD";
  } else if (o.payment_status === 'verification_needed') {
    paymentStatus = "Verification Needed";
  } else if (o.payment_status === 'paid') {
    paymentStatus = "Paid";
  } else if (o.payment_status === 'failed') {
    paymentStatus = "Failed";
  }

  const statusMap: Record<string, Order["status"]> = {
    pending: "Pending",
    confirmed: "Confirmed",
    processing: "Processing",
    packed: "Packed",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };

  const paymentMap: Record<string, Order["payment"]> = {
    cod: "COD",
    bkash: "bKash",
    nagad: "Nagad",
    rocket: "Rocket",
    sslcommerz: "Card",
    shurjopay: "ShurjoPay"
  };

  return {
    id: o.order_number,
    customer: o.customer_name,
    phone: o.customer_phone,
    district: o.address?.district || "Dhaka",
    date: o.created_at.slice(0, 10),
    items: o.items ? o.items.reduce((sum: number, item: any) => sum + item.quantity, 0) : 1,
    total: o.total_amount,
    payment: paymentMap[o.payment_method] ?? "COD",
    paymentStatus,
    status: statusMap[o.order_status] ?? "Pending",
    courier: o.courier_name ?? undefined,
    trackingId: o.tracking_id ?? undefined,
    trxId: o.payments?.[0]?.trx_id ?? undefined
  };
}

/* ──────────────────────────── Context ──────────────────────────── */

const Ctx = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  /* ───── Auth state ───── */
  const [auth, setAuth] = useState<AdminAuth>(() =>
    load("nongor_admin_auth", { isAdmin: false, email: "" }),
  );
  const [authLoading, setAuthLoading] = useState(true);

  // On mount: check Supabase session if configured
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthLoading(false);
      return;
    }

    let mounted = true;

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (mounted) {
          const isAdmin = profile?.role === "admin";
          const newAuth: AdminAuth = {
            isAdmin,
            email: session.user.email ?? "",
            userId: session.user.id,
          };
          setAuth(newAuth);
          save("nongor_admin_auth", newAuth);
        }
      }
      if (mounted) setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT" || !session) {
          const noAuth: AdminAuth = { isAdmin: false, email: "" };
          setAuth(noAuth);
          save("nongor_admin_auth", noAuth);
          return;
        }

        if (session?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          if (mounted) {
            const isAdmin = profile?.role === "admin";
            const newAuth: AdminAuth = {
              isAdmin,
              email: session.user.email ?? "",
              userId: session.user.id,
            };
            setAuth(newAuth);
            save("nongor_admin_auth", newAuth);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ───── Login: Supabase Auth with admin role check ───── */
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (!isSupabaseConfigured) {
      // Fallback mock login for development without Supabase
      if (email === "admin@nongor.com" && password === "nongor2024") {
        const a: AdminAuth = { isAdmin: true, email };
        setAuth(a);
        save("nongor_admin_auth", a);
        return true;
      }
      return false;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      console.error("[auth] login error:", error);
      return false;
    }

    // Check admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .single();

    if (profile?.role !== "admin") {
      // Not an admin — sign them out of the admin panel
      await supabase.auth.signOut();
      return false;
    }

    const a: AdminAuth = { isAdmin: true, email: data.user.email ?? "", userId: data.user.id };
    setAuth(a);
    save("nongor_admin_auth", a);
    return true;
  }, []);

  /* ───── Logout ───── */
  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    const a: AdminAuth = { isAdmin: false, email: "" };
    setAuth(a);
    save("nongor_admin_auth", a);
  }, []);

  /* ───── State Declarations ───── */
  const [products, setProducts] = useState<Product[]>(() =>
    load("nongor_admin_products", defaultProducts),
  );
  const [orders, setOrders] = useState<Order[]>(() =>
    load("nongor_orders", defaultOrders),
  );
  const [coupons, setCoupons] = useState<Coupon[]>(() =>
    load("nongor_admin_coupons", defaultCoupons as Coupon[]),
  );
  const [settings, setSettings] = useState<Record<string, string>>(() =>
    load("nongor_admin_settings", {
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
    }),
  );

  // Sync to local storage for offline use
  useEffect(() => { if (!isSupabaseConfigured) save("nongor_admin_products", products); }, [products]);
  useEffect(() => { if (!isSupabaseConfigured) save("nongor_orders", orders); }, [orders]);
  useEffect(() => { if (!isSupabaseConfigured) save("nongor_admin_coupons", coupons); }, [coupons]);
  useEffect(() => { if (!isSupabaseConfigured) save("nongor_admin_settings", settings); }, [settings]);

  // Load live database data if Supabase is configured and logged in as admin
  useEffect(() => {
    if (!auth.isAdmin || !isSupabaseConfigured) return;

    let mounted = true;

    async function loadData() {
      try {
        const [dbProds, dbOrders, dbCoupons, dbSettings] = await Promise.all([
          adminGetAllProducts(),
          adminGetAllOrders(),
          adminGetAllCoupons(),
          getSettings(),
        ]);

        if (mounted) {
          setProducts(toMockProducts(dbProds));
          setOrders(dbOrders.map(toMockOrder));
          setCoupons(dbCoupons.map(c => ({
            code: c.code,
            type: c.type === 'percent' ? 'Percentage'
                : c.type === 'flat' ? 'Flat'
                : 'Free Delivery',
            value: c.value,
            minOrder: c.minimum_order,
            expiry: c.expires_at ? c.expires_at.slice(0, 10) : '2026-12-31',
            uses: c.used_count,
            active: c.is_active,
          })));
          setSettings(dbSettings);
        }
      } catch (err) {
        console.error("[admin store] Load live database data error:", err);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [auth.isAdmin]);

  /* ───── Products actions ───── */
  const addProduct = useCallback(async (p: Product) => {
    if (!isSupabaseConfigured) {
      setProducts((prev) => [p, ...prev]);
      return;
    }

    try {
      let categoryId = null;
      if (p.category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("name", p.category)
          .maybeSingle();

        if (cat) {
          categoryId = cat.id;
        } else {
          const { data: newCat } = await supabase
            .from("categories")
            .insert({
              name: p.category,
              slug: p.category.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
              is_active: true,
              sort_order: 0
            })
            .select("id")
            .single();
          if (newCat) categoryId = newCat.id;
        }
      }

      const { data: prod, error } = await supabase
        .from("products")
        .insert({
          name: p.name,
          slug: p.slug,
          price: p.price,
          discount_price: p.discountPrice ?? null,
          category_id: categoryId,
          occasion: p.occasion,
          fabric: p.fabric,
          description: p.description,
          status: p.status.toLowerCase() as any,
          is_featured: p.featured ?? false,
          is_new_arrival: p.isNew ?? false,
          is_best_seller: p.isBestSeller ?? false,
        })
        .select()
        .single();

      if (error || !prod) {
        console.error("Error creating product:", error);
        return;
      }

      if (p.images && p.images.length > 0) {
        const imgRows = p.images.map((url, i) => ({
          product_id: prod.id,
          image_url: url,
          alt_text: p.name,
          display_order: i,
          is_primary: i === 0,
        }));
        await supabase.from("product_images").insert(imgRows);
      }

      const variantRows: any[] = [];
      const defaultSizes = p.sizes && p.sizes.length > 0 ? p.sizes : ["M"];
      const defaultColors = p.colors && p.colors.length > 0 ? p.colors : [{ name: "Default", hex: "#888888" }];

      for (const size of defaultSizes) {
        for (const col of defaultColors) {
          const varStock = p.stockByVariant?.[`${size}-${col.name}`] ?? Math.floor(p.stock / (defaultSizes.length * defaultColors.length)) ?? p.stock;
          variantRows.push({
            product_id: prod.id,
            size,
            color: col.name,
            stock: varStock,
            is_active: true,
          });
        }
      }

      if (variantRows.length > 0) {
        await supabase.from("product_variants").insert(variantRows);
      }

      const dbProds = await adminGetAllProducts();
      setProducts(toMockProducts(dbProds));
    } catch (err) {
      console.error("addProduct error:", err);
    }
  }, []);

  const updateProduct = useCallback(async (id: string, patch: Partial<Product>) => {
    if (!isSupabaseConfigured) {
      setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
      return;
    }

    try {
      let categoryId = undefined;
      if (patch.category) {
        const { data: cat } = await supabase
          .from("categories")
          .select("id")
          .eq("name", patch.category)
          .maybeSingle();
        if (cat) {
          categoryId = cat.id;
        }
      }

      const dbPatch: any = {};
      if (patch.name !== undefined) dbPatch.name = patch.name;
      if (patch.slug !== undefined) dbPatch.slug = patch.slug;
      if (patch.price !== undefined) dbPatch.price = patch.price;
      if (patch.discountPrice !== undefined) dbPatch.discount_price = patch.discountPrice;
      if (categoryId !== undefined) dbPatch.category_id = categoryId;
      if (patch.occasion !== undefined) dbPatch.occasion = patch.occasion;
      if (patch.fabric !== undefined) dbPatch.fabric = patch.fabric;
      if (patch.description !== undefined) dbPatch.description = patch.description;
      if (patch.status !== undefined) dbPatch.status = patch.status.toLowerCase();
      if (patch.featured !== undefined) dbPatch.is_featured = patch.featured;
      if (patch.isNew !== undefined) dbPatch.is_new_arrival = patch.isNew;
      if (patch.isBestSeller !== undefined) dbPatch.is_best_seller = patch.isBestSeller;

      if (Object.keys(dbPatch).length > 0) {
        await supabase.from("products").update(dbPatch).eq("id", id);
      }

      if (patch.stock !== undefined) {
        const { data: vars } = await supabase
          .from("product_variants")
          .select("id")
          .eq("product_id", id);

        if (vars && vars.length > 0) {
          const singleStock = Math.floor(patch.stock / vars.length);
          for (const v of vars) {
            await supabase
              .from("product_variants")
              .update({ stock: singleStock })
              .eq("id", v.id);
          }
        }
      }

      const dbProds = await adminGetAllProducts();
      setProducts(toMockProducts(dbProds));
    } catch (err) {
      console.error("updateProduct error:", err);
    }
  }, []);

  const deleteProduct = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) {
      setProducts((prev) => prev.filter((p) => p.id !== id));
      return;
    }

    try {
      await supabase.from("products").delete().eq("id", id);
      const dbProds = await adminGetAllProducts();
      setProducts(toMockProducts(dbProds));
    } catch (err) {
      console.error("deleteProduct error:", err);
    }
  }, []);

  /* ───── Orders actions ───── */
  const addOrder = useCallback((o: Order) => {
    setOrders((prev) => [o, ...prev]);
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: Order["status"]) => {
    if (!isSupabaseConfigured) {
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
      return;
    }

    try {
      const statusMap: Record<string, string> = {
        Pending: "pending",
        Confirmed: "confirmed",
        Processing: "processing",
        Packed: "packed",
        Shipped: "shipped",
        Delivered: "delivered",
        Cancelled: "cancelled",
      };
      const dbStatus = statusMap[status] ?? "pending";

      await supabase
        .from("orders")
        .update({ order_status: dbStatus as any })
        .eq("order_number", id);

      const dbOrders = await adminGetAllOrders();
      setOrders(dbOrders.map(toMockOrder));
    } catch (err) {
      console.error("updateOrderStatus error:", err);
    }
  }, []);

  /* ───── Payments actions ───── */
  const approvePayment = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) {
      setOrders((prev) =>
        prev.map((o) =>
          o.id === id
            ? {
                ...o,
                paymentStatus: "Paid" as const,
                status: o.status === "Pending" ? ("Confirmed" as const) : o.status,
              }
            : o,
        ),
      );
      return;
    }

    try {
      const { data } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", id)
        .single();

      if (data) {
        const success = await approvePaymentService(data.id);
        if (success) {
          const dbOrders = await adminGetAllOrders();
          setOrders(dbOrders.map(toMockOrder));
        }
      }
    } catch (err) {
      console.error("approvePayment error:", err);
    }
  }, []);

  const rejectPayment = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Failed" as const } : o)),
      );
      return;
    }

    try {
      const { data } = await supabase
        .from("orders")
        .select("id")
        .eq("order_number", id)
        .single();

      if (data) {
        const success = await rejectPaymentService(data.id);
        if (success) {
          const dbOrders = await adminGetAllOrders();
          setOrders(dbOrders.map(toMockOrder));
        }
      }
    } catch (err) {
      console.error("rejectPayment error:", err);
    }
  }, []);

  const resetPayment = useCallback(async (id: string) => {
    if (!isSupabaseConfigured) {
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, paymentStatus: "Pending" as const } : o)),
      );
      return;
    }

    try {
      await supabase
        .from("orders")
        .update({ payment_status: "verification_needed" })
        .eq("order_number", id);

      const dbOrders = await adminGetAllOrders();
      setOrders(dbOrders.map(toMockOrder));
    } catch (err) {
      console.error("resetPayment error:", err);
    }
  }, []);

  /* ───── Coupons actions ───── */
  const addCoupon = useCallback(async (c: Coupon) => {
    if (!isSupabaseConfigured) {
      setCoupons((prev) => [c, ...prev]);
      return;
    }

    try {
      await supabase.from("coupons").insert({
        code: c.code.toUpperCase(),
        type: c.type === "Percentage" ? "percent"
            : c.type === "Flat" ? "flat"
            : "free_delivery",
        value: c.value,
        minimum_order: c.minOrder,
        expires_at: c.expiry ? new Date(c.expiry).toISOString() : null,
        is_active: c.active,
        used_count: 0,
      });

      const dbCoupons = await adminGetAllCoupons();
      setCoupons(dbCoupons.map(dbC => ({
        code: dbC.code,
        type: dbC.type === 'percent' ? 'Percentage'
            : dbC.type === 'flat' ? 'Flat'
            : 'Free Delivery',
        value: dbC.value,
        minOrder: dbC.minimum_order,
        expiry: dbC.expires_at ? dbC.expires_at.slice(0, 10) : '2026-12-31',
        uses: dbC.used_count,
        active: dbC.is_active,
      })));
    } catch (err) {
      console.error("addCoupon error:", err);
    }
  }, []);

  const updateCoupon = useCallback(async (code: string, patch: Partial<Coupon>) => {
    if (!isSupabaseConfigured) {
      setCoupons((prev) => prev.map((c) => (c.code === code ? { ...c, ...patch } : c)));
      return;
    }

    try {
      const dbPatch: any = {};
      if (patch.type !== undefined) {
        dbPatch.type = patch.type === "Percentage" ? "percent"
            : patch.type === "Flat" ? "flat"
            : "free_delivery";
      }
      if (patch.value !== undefined) dbPatch.value = patch.value;
      if (patch.minOrder !== undefined) dbPatch.minimum_order = patch.minOrder;
      if (patch.expiry !== undefined) dbPatch.expires_at = patch.expiry ? new Date(patch.expiry).toISOString() : null;
      if (patch.active !== undefined) dbPatch.is_active = patch.active;

      await supabase.from("coupons").update(dbPatch).eq("code", code.toUpperCase());

      const dbCoupons = await adminGetAllCoupons();
      setCoupons(dbCoupons.map(dbC => ({
        code: dbC.code,
        type: dbC.type === 'percent' ? 'Percentage'
            : dbC.type === 'flat' ? 'Flat'
            : 'Free Delivery',
        value: dbC.value,
        minOrder: dbC.minimum_order,
        expiry: dbC.expires_at ? dbC.expires_at.slice(0, 10) : '2026-12-31',
        uses: dbC.used_count,
        active: dbC.is_active,
      })));
    } catch (err) {
      console.error("updateCoupon error:", err);
    }
  }, []);

  const deleteCoupon = useCallback(async (code: string) => {
    if (!isSupabaseConfigured) {
      setCoupons((prev) => prev.filter((c) => c.code !== code));
      return;
    }

    try {
      await supabase.from("coupons").delete().eq("code", code.toUpperCase());

      const dbCoupons = await adminGetAllCoupons();
      setCoupons(dbCoupons.map(dbC => ({
        code: dbC.code,
        type: dbC.type === 'percent' ? 'Percentage'
            : dbC.type === 'flat' ? 'Flat'
            : 'Free Delivery',
        value: dbC.value,
        minOrder: dbC.minimum_order,
        expiry: dbC.expires_at ? dbC.expires_at.slice(0, 10) : '2026-12-31',
        uses: dbC.used_count,
        active: dbC.is_active,
      })));
    } catch (err) {
      console.error("deleteCoupon error:", err);
    }
  }, []);

  /* ───── Settings actions ───── */
  const updateSetting = useCallback(async (key: string, value: string) => {
    if (!isSupabaseConfigured) {
      setSettings((prev) => ({ ...prev, [key]: value }));
      return;
    }

    try {
      await adminUpdateSetting(key, value);
      const dbSettings = await getSettings();
      setSettings(dbSettings);
    } catch (err) {
      console.error("updateSetting error:", err);
    }
  }, []);

  return (
    <Ctx.Provider
      value={{
        auth,
        login,
        logout,
        authLoading,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        orders,
        addOrder,
        updateOrderStatus,
        approvePayment,
        rejectPayment,
        resetPayment,
        coupons,
        addCoupon,
        updateCoupon,
        deleteCoupon,
        settings,
        updateSetting,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAdmin(): AdminState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAdmin must be used within AdminProvider");
  return v;
}

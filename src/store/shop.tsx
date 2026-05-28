import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/data/mock";
import { products as defaultProducts } from "@/data/mock";
import { isSupabaseConfigured } from "@/lib/supabase";
import { getVariantStock as getSupabaseVariantStock } from "@/services/products";
import { toast } from "sonner";

export type CartItem = {
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  size: string;
  color: string;
  qty: number;
};

type ShopState = {
  cart: CartItem[];
  wishlist: string[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (i: number) => void;
  updateQty: (i: number, qty: number) => void;
  clearCart: () => void;
  toggleWishlist: (id: string) => void;
  cartCount: number;
  cartTotal: number;
};

const Ctx = createContext<ShopState | null>(null);

const isBrowser = typeof window !== "undefined";
const load = <T,>(k: string, fallback: T): T => {
  if (!isBrowser) return fallback;
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
};

/** Get stock — async version for Supabase, sync fallback for mock */
export async function getProductStockAsync(productId: string, size?: string, color?: string): Promise<number> {
  if (isSupabaseConfigured && size && color) {
    return getSupabaseVariantStock(productId, size, color);
  }
  return getProductStockSync(productId, size, color);
}

/** Sync stock check — localStorage/mock fallback only */
export function getProductStockSync(productId: string, size?: string, color?: string): number {
  if (typeof window === "undefined") return 99; // SSR fallback
  try {
    const v = localStorage.getItem("nongor_admin_products");
    const productsList = v ? JSON.parse(v) : defaultProducts;
    const product = productsList.find((p: any) => p.id === productId);
    if (!product) return 0;

    // Support variant stock key structure e.g. "M-Maroon"
    if (product.stockByVariant && size && color) {
      const key = `${size}-${color}`;
      const val = product.stockByVariant[key];
      if (val !== undefined) return val;
    }
    return product.stock ?? 0;
  } catch {
    return 0;
  }
}

// Keep old name as alias for backwards compat (sync version)
export const getProductStock = getProductStockSync;

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => load("nongor_cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() => load("nongor_wishlist", []));

  useEffect(() => { if (isBrowser) localStorage.setItem("nongor_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if (isBrowser) localStorage.setItem("nongor_wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const addToCart = (item: CartItem) => {
    const maxStock = getProductStock(item.productId, item.size, item.color);
    if (maxStock <= 0) {
      toast.error(`Sorry, ${item.name} is currently out of stock in this variant.`);
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId && p.size === item.size && p.color === item.color);
      if (idx >= 0) {
        const currentQty = prev[idx].qty;
        const requestedQty = currentQty + item.qty;

        if (requestedQty > maxStock) {
          toast.warning(`Only ${maxStock} items available in stock. Capped order at stock limit.`);
          const next = [...prev];
          next[idx] = { ...next[idx], qty: maxStock };
          return next;
        }

        const next = [...prev];
        next[idx] = { ...next[idx], qty: requestedQty };
        return next;
      }

      if (item.qty > maxStock) {
        toast.warning(`Only ${maxStock} items available in stock. Added maximum available.`);
        return [...prev, { ...item, qty: maxStock }];
      }

      toast.success(`${item.name} added to bag!`);
      return [...prev, item];
    });
  };

  const removeFromCart = (i: number) => setCart((p) => p.filter((_, idx) => idx !== i));

  const updateQty = (i: number, qty: number) => {
    setCart((prev) => {
      if (i < 0 || i >= prev.length) return prev;
      const item = prev[i];
      const maxStock = getProductStock(item.productId, item.size, item.color);
      const targetQty = Math.max(1, qty);

      if (targetQty > maxStock) {
        toast.warning(`Only ${maxStock} items available in stock in this variant.`);
        return prev.map((it, idx) => (idx === i ? { ...it, qty: maxStock } : it));
      }

      return prev.map((it, idx) => (idx === i ? { ...it, qty: targetQty } : it));
    });
  };

  const clearCart = () => setCart([]);
  const toggleWishlist = (id: string) =>
    setWishlist((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const cartTotal = cart.reduce((s, i) => s + i.qty * i.price, 0);

  return (
    <Ctx.Provider value={{ cart, wishlist, addToCart, removeFromCart, updateQty, clearCart, toggleWishlist, cartCount, cartTotal }}>
      {children}
    </Ctx.Provider>
  );
}

export const useShop = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShop outside ShopProvider");
  return v;
};

export const quickAddToCart = (
  shop: any,
  p: Product,
  opts?: { size?: string; color?: string; qty?: number }
) =>
  shop.addToCart({
    productId: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0],
    price: p.discountPrice ?? p.price,
    size: opts?.size ?? p.sizes[0],
    color: opts?.color ?? p.colors[0].name,
    qty: opts?.qty ?? 1,
  });

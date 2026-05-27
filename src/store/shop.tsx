import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/data/mock";

export type CartItem = {
  productId: string;
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

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => load("nongor_cart", []));
  const [wishlist, setWishlist] = useState<string[]>(() => load("nongor_wishlist", []));

  useEffect(() => { if (isBrowser) localStorage.setItem("nongor_cart", JSON.stringify(cart)); }, [cart]);
  useEffect(() => { if (isBrowser) localStorage.setItem("nongor_wishlist", JSON.stringify(wishlist)); }, [wishlist]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const idx = prev.findIndex((p) => p.productId === item.productId && p.size === item.size && p.color === item.color);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
  };
  const removeFromCart = (i: number) => setCart((p) => p.filter((_, idx) => idx !== i));
  const updateQty = (i: number, qty: number) =>
    setCart((p) => p.map((it, idx) => (idx === i ? { ...it, qty: Math.max(1, qty) } : it)));
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
  shop: ShopState,
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

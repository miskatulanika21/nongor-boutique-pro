import type { Product } from "@/data/mock";

/**
 * Get available stock for a specific variant (size + color).
 * Currently falls back to product-level `stock`, but once `stockByVariant`
 * is populated the lookup becomes per-variant automatically.
 */
export function getStock(product: Product, size?: string, color?: string): number {
  if (product.stockByVariant && size && color) {
    const key = `${size}-${color}`;
    const v = product.stockByVariant[key];
    if (v !== undefined) return v;
  }
  return product.stock;
}

/** True when the product (or specific variant) is out of stock. */
export function isOutOfStock(product: Product, size?: string, color?: string): boolean {
  return getStock(product, size, color) <= 0;
}

/** True when stock is low (≤ threshold, default 5). */
export function isLowStock(
  product: Product,
  size?: string,
  color?: string,
  threshold = 5,
): boolean {
  const s = getStock(product, size, color);
  return s > 0 && s <= threshold;
}

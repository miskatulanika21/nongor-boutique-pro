/**
 * Product data hooks — fetch from Supabase with mock fallback.
 * Returns data in the mock `Product` format so zero UI changes needed.
 *
 * These hooks use simple useState/useEffect (not React Query) to keep
 * the migration incremental. React Query can be layered on later.
 */
import { useState, useEffect } from 'react';
import {
  getPublishedProducts,
  getProductBySlug,
  getNewArrivals,
  getBestSellers,
  getFeaturedProducts,
  adminGetAllProducts,
} from '@/services/products';
import { toMockProducts, toMockProduct } from '@/lib/product-adapter';
import { products as mockProducts } from '@/data/mock';
import type { Product } from '@/data/mock';

/** All published products (for shop page, homepage grids) */
export function usePublishedProducts() {
  const [products, setProducts] = useState<Product[]>(
    () => mockProducts.filter(p => p.status === 'Published')
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getPublishedProducts()
      .then(data => { if (mounted) setProducts(toMockProducts(data)); })
      .catch((err) => { if (mounted) setError(err.message ?? 'Failed to load products'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { products, loading, error };
}

/** Single product by slug (for product detail page) */
export function useProductBySlug(slug: string) {
  const mockProduct = mockProducts.find(p => p.slug === slug) ?? null;
  const [product, setProduct] = useState<Product | null>(mockProduct);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getProductBySlug(slug)
      .then(data => { if (mounted) setProduct(data ? toMockProduct(data) : null); })
      .catch((err) => { if (mounted) setError(err.message ?? 'Failed to load product'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [slug]);

  return { product, loading, error };
}

/** New arrivals for homepage section */
export function useNewArrivals(limit = 4) {
  const [products, setProducts] = useState<Product[]>(
    () => mockProducts.filter(p => p.isNew).slice(0, limit)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getNewArrivals()
      .then(data => { if (mounted) setProducts(toMockProducts(data).slice(0, limit)); })
      .catch((err) => { if (mounted) setError(err.message ?? 'Failed to load new arrivals'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [limit]);

  return { products, loading, error };
}

/** Best sellers for homepage section */
export function useBestSellers(limit = 4) {
  const [products, setProducts] = useState<Product[]>(
    () => mockProducts.filter(p => p.isBestSeller).slice(0, limit)
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getBestSellers()
      .then(data => { if (mounted) setProducts(toMockProducts(data).slice(0, limit)); })
      .catch((err) => { if (mounted) setError(err.message ?? 'Failed to load best sellers'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [limit]);

  return { products, loading, error };
}

/** All products for admin panel (includes draft/archived) */
export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>(() => mockProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    adminGetAllProducts()
      .then(data => { if (mounted) setProducts(toMockProducts(data)); })
      .catch((err) => { if (mounted) setError(err.message ?? 'Failed to load products'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const refetch = () => {
    setLoading(true);
    setError(null);
    adminGetAllProducts()
      .then(data => { setProducts(toMockProducts(data)); })
      .catch((err) => setError(err.message ?? 'Failed to reload products'))
      .finally(() => setLoading(false));
  };

  return { products, loading, error, refetch };
}

/** All published products as a flat list (for instagram grid, etc.) */
export function useAllProducts() {
  const [products, setProducts] = useState<Product[]>(() => mockProducts);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getPublishedProducts()
      .then(data => { if (mounted) setProducts(toMockProducts(data)); })
      .catch((err) => { if (mounted) setError(err.message ?? 'Failed to load products'); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  return { products, loading, error };
}

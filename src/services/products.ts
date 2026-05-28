/**
 * Product service — fetches from Supabase with mock fallback
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { ProductWithDetails, DbProduct, ProductImage, ProductVariant } from '@/lib/database.types';
import { products as mockProducts, type Product as MockProduct } from '@/data/mock';

// ─── Public queries ────────────────────────────────────────

/** Fetch all published products with images & variants */
export async function getPublishedProducts(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) return mockToDetails(mockProducts.filter(p => p.status === 'Published'));

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      variants:product_variants(*),
      category:categories(*)
    `)
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[products] getPublishedProducts error:', error);
    return mockToDetails(mockProducts.filter(p => p.status === 'Published'));
  }

  return (data ?? []) as ProductWithDetails[];
}

/** Fetch single product by slug */
export async function getProductBySlug(slug: string): Promise<ProductWithDetails | null> {
  if (!isSupabaseConfigured) {
    const m = mockProducts.find(p => p.slug === slug);
    return m ? mockToDetail(m) : null;
  }

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      variants:product_variants(*),
      category:categories(*)
    `)
    .eq('slug', slug)
    .single();

  if (error) {
    console.error('[products] getProductBySlug error:', error);
    const m = mockProducts.find(p => p.slug === slug);
    return m ? mockToDetail(m) : null;
  }

  return data as ProductWithDetails;
}

/** Fetch featured products */
export async function getFeaturedProducts(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) return mockToDetails(mockProducts.filter(p => p.featured));

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[products] getFeaturedProducts error:', error);
    return mockToDetails(mockProducts.filter(p => p.featured));
  }

  return (data ?? []) as ProductWithDetails[];
}

/** Fetch new arrivals */
export async function getNewArrivals(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) return mockToDetails(mockProducts.filter(p => p.isNew));

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('status', 'published')
    .eq('is_new_arrival', true)
    .order('created_at', { ascending: false });

  if (error) return mockToDetails(mockProducts.filter(p => p.isNew));
  return (data ?? []) as ProductWithDetails[];
}

/** Fetch best sellers */
export async function getBestSellers(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) return mockToDetails(mockProducts.filter(p => p.isBestSeller));

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*)')
    .eq('status', 'published')
    .eq('is_best_seller', true)
    .order('created_at', { ascending: false });

  if (error) return mockToDetails(mockProducts.filter(p => p.isBestSeller));
  return (data ?? []) as ProductWithDetails[];
}

/** Get variant stock for a product */
export async function getVariantStock(productId: string, size: string, color: string): Promise<number> {
  if (!isSupabaseConfigured) return 99; // mock fallback

  const { data, error } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('product_id', productId)
    .eq('size', size)
    .eq('color', color)
    .eq('is_active', true)
    .single();

  if (error || !data) return 0;
  return data.stock;
}

// ─── Admin queries ─────────────────────────────────────────

/** Fetch ALL products (admin — includes draft/archived) */
export async function adminGetAllProducts(): Promise<ProductWithDetails[]> {
  if (!isSupabaseConfigured) return mockToDetails(mockProducts);

  const { data, error } = await supabase
    .from('products')
    .select('*, images:product_images(*), variants:product_variants(*), category:categories(*)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[products] adminGetAllProducts error:', error);
    return mockToDetails(mockProducts);
  }

  return (data ?? []) as ProductWithDetails[];
}

/** Create a new product */
export async function adminCreateProduct(
  product: Omit<DbProduct, 'id' | 'created_at' | 'updated_at'>
): Promise<DbProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) { console.error('[products] create error:', error); return null; }
  return data;
}

/** Update a product */
export async function adminUpdateProduct(
  id: string,
  patch: Partial<DbProduct>
): Promise<DbProduct | null> {
  const { data, error } = await supabase
    .from('products')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) { console.error('[products] update error:', error); return null; }
  return data;
}

/** Delete a product */
export async function adminDeleteProduct(id: string): Promise<boolean> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) { console.error('[products] delete error:', error); return false; }
  return true;
}

// ─── Mock → Supabase type adapter ──────────────────────────
// Converts old mock Product to ProductWithDetails for fallback

function mockToDetail(m: MockProduct): ProductWithDetails {
  return {
    id: m.id,
    category_id: null,
    name: m.name,
    slug: m.slug,
    description: m.description,
    short_description: null,
    price: m.price,
    discount_price: m.discountPrice ?? null,
    fabric: m.fabric,
    occasion: m.occasion ?? null,
    care_instructions: null,
    status: m.status.toLowerCase() as 'draft' | 'published' | 'archived',
    is_featured: m.featured ?? false,
    is_new_arrival: m.isNew ?? false,
    is_best_seller: m.isBestSeller ?? false,
    seo_title: null,
    seo_description: null,
    created_at: m.createdAt ?? new Date().toISOString(),
    updated_at: m.createdAt ?? new Date().toISOString(),
    images: m.images.map((url, i) => ({
      id: `${m.id}-img-${i}`,
      product_id: m.id,
      image_url: url,
      alt_text: m.name,
      display_order: i,
      is_primary: i === 0,
      created_at: m.createdAt ?? new Date().toISOString(),
    })),
    variants: m.sizes.flatMap(size =>
      m.colors.map(color => ({
        id: `${m.id}-${size}-${color.name}`,
        product_id: m.id,
        size,
        color: color.name,
        sku: null,
        stock: m.stockByVariant?.[`${size}-${color.name}`] ?? m.stock,
        price_override: null,
        is_active: true,
        created_at: m.createdAt ?? new Date().toISOString(),
      }))
    ),
  };
}

function mockToDetails(mocks: MockProduct[]): ProductWithDetails[] {
  return mocks.map(mockToDetail);
}

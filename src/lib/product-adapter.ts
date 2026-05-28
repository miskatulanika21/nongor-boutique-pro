/**
 * Product adapter — converts Supabase `ProductWithDetails` to the mock `Product` shape
 * used by all existing UI components (ProductCard, stock.ts, quickAddToCart, etc.).
 *
 * This lets us swap the data source without touching any UI code.
 */
import type { ProductWithDetails } from './database.types';
import type { Product } from '@/data/mock';

/**
 * Known color hex values for the Nongor palette.
 * When Supabase variant colors don't have a hex, we map them here.
 */
const COLOR_HEX: Record<string, string> = {
  Maroon: '#6B1D1D',
  Ivory: '#FFFFF0',
  Gold: '#C5A04E',
  Beige: '#D4C5A9',
  Rose: '#C08081',
  Wine: '#722F37',
  Mustard: '#C49B2F',
  Teal: '#2C6E6A',
  Olive: '#6B7F3B',
  Black: '#1A1A1A',
  White: '#FAFAFA',
  Cream: '#F5F0E6',
  Red: '#B22222',
  Navy: '#1F2D5A',
  Coral: '#E07C6E',
  Terracotta: '#C67B5C',
};

/** Convert a Supabase product to the mock Product shape */
export function toMockProduct(p: ProductWithDetails): Product {
  // Extract unique sizes from variants (preserve order)
  const sizeSet = new Set<string>();
  p.variants.forEach(v => { if (v.is_active) sizeSet.add(v.size); });
  const sizes = [...sizeSet];
  if (sizes.length === 0) sizes.push('M'); // fallback

  // Extract unique colors from variants
  const colorSet = new Set<string>();
  p.variants.forEach(v => { if (v.is_active) colorSet.add(v.color); });
  const colors = [...colorSet].map(name => ({
    name,
    hex: COLOR_HEX[name] ?? '#888888',
  }));
  if (colors.length === 0) colors.push({ name: 'Default', hex: '#888888' });

  // Compute total stock from active variants
  const stock = p.variants
    .filter(v => v.is_active)
    .reduce((sum, v) => sum + v.stock, 0);

  // Build stockByVariant map
  const stockByVariant: Record<string, number> = {};
  p.variants
    .filter(v => v.is_active)
    .forEach(v => { stockByVariant[`${v.size}-${v.color}`] = v.stock; });

  // Get image URLs sorted by display_order
  const images = p.images
    .slice()
    .sort((a, b) => a.display_order - b.display_order)
    .map(i => i.image_url);

  // Determine collection tags
  const collection: string[] = [];
  if (p.is_new_arrival) collection.push('New Arrival');
  if (p.is_best_seller) collection.push('Best Seller');
  if (p.is_featured) collection.push('Festive Collection');
  if (collection.length === 0) collection.push('Handmade Kurti');

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    bnName: undefined, // not in Supabase schema yet
    price: p.price,
    discountPrice: p.discount_price ?? undefined,
    category: p.category?.name ?? 'Kurti',
    occasion: p.occasion ?? 'Everyday',
    collection,
    fabric: p.fabric ?? '',
    sizes,
    colors,
    images: images.length > 0 ? images : ['https://placehold.co/800x1000?text=No+Image'],
    stock,
    stockByVariant: Object.keys(stockByVariant).length > 0 ? stockByVariant : undefined,
    rating: 4.8, // TODO: compute from reviews table later
    reviewCount: p.reviews?.length ?? 0,
    description: p.description ?? '',
    createdAt: p.created_at,
    isNew: p.is_new_arrival,
    isBestSeller: p.is_best_seller,
    featured: p.is_featured,
    status: p.status === 'published' ? 'Published'
          : p.status === 'draft' ? 'Draft'
          : 'Archived',
  };
}

/** Convert an array of Supabase products to mock Product array */
export function toMockProducts(products: ProductWithDetails[]): Product[] {
  return products.map(toMockProduct);
}

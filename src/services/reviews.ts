/**
 * Reviews service — fetches from Supabase with mock fallback
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { reviews as mockReviews } from '@/data/mock';

export type Review = {
  id: string;
  product: string;
  customer: string;
  rating: number;
  text: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  createdAt: string;
};

export async function getAllReviews(): Promise<Review[]> {
  if (!isSupabaseConfigured) {
    return mockReviews.map(r => ({
      id: r.id,
      product: r.product,
      customer: r.customer,
      rating: r.rating,
      text: r.text,
      status: r.status as any,
      createdAt: new Date().toISOString(),
    }));
  }

  // Load reviews from Supabase and join with product name
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      products(name)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[reviews] getAllReviews error:', error);
    return mockReviews.map(r => ({
      id: r.id,
      product: r.product,
      customer: r.customer,
      rating: r.rating,
      text: r.text,
      status: r.status as any,
      createdAt: new Date().toISOString(),
    }));
  }

  return (data ?? []).map((r: any) => ({
    id: r.id,
    product: r.products?.name ?? 'Unknown Product',
    customer: r.customer_name || 'Anonymous',
    rating: r.rating,
    text: r.body || '',
    status: r.approved ? 'Approved' : 'Pending',
    createdAt: r.created_at,
  }));
}

export async function approveReview(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const { error } = await supabase
    .from('reviews')
    .update({ approved: true })
    .eq('id', id);

  if (error) {
    console.error('[reviews] approveReview error:', error);
    return false;
  }
  return true;
}

export async function deleteReview(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('[reviews] deleteReview error:', error);
    return false;
  }
  return true;
}

/**
 * Storage service — upload/delete files in Supabase Storage buckets
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type Bucket = 'product-images' | 'payment-proofs' | 'brand-assets';

/** Upload a file to a storage bucket */
export async function uploadFile(
  bucket: Bucket,
  path: string,
  file: File,
  options?: { upsert?: boolean }
): Promise<{ url: string } | { error: string }> {
  if (!isSupabaseConfigured) return { error: 'Supabase not configured' };

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: options?.upsert ?? false });

  if (error) {
    console.error(`[storage] upload to ${bucket} error:`, error);
    return { error: error.message };
  }

  const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: urlData.publicUrl };
}

/** Get the public URL for a file */
export function getPublicUrl(bucket: Bucket, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Delete a file from a storage bucket */
export async function deleteFile(bucket: Bucket, path: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.error(`[storage] delete from ${bucket} error:`, error);
    return false;
  }
  return true;
}

/** Upload a product image and return its public URL */
export async function uploadProductImage(file: File, productSlug: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${productSlug}/${Date.now()}.${ext}`;
  const result = await uploadFile('product-images', path, file);
  return 'url' in result ? result.url : null;
}

/** Delete a product image by its full URL (extracts the path) */
export async function deleteProductImage(imageUrl: string): Promise<boolean> {
  // Extract path from URL: https://xxx.supabase.co/storage/v1/object/public/product-images/path
  const marker = '/product-images/';
  const idx = imageUrl.indexOf(marker);
  if (idx === -1) return false;
  const path = imageUrl.slice(idx + marker.length);
  return deleteFile('product-images', path);
}

/** Upload payment proof */
export async function uploadPaymentProof(file: File, orderId: string): Promise<string | null> {
  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${orderId}/${Date.now()}.${ext}`;
  const result = await uploadFile('payment-proofs', path, file);
  return 'url' in result ? result.url : null;
}

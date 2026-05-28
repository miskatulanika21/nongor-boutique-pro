/**
 * Payments service — approve/reject via RPC, proof upload
 */
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { Payment } from '@/lib/database.types';

/** Approve a manual payment (admin only, calls RPC) */
export async function approvePayment(orderId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('approve_manual_payment', {
    p_order_id: orderId,
  });

  if (error) { console.error('[payments] approve error:', error); return false; }
  return true;
}

/** Reject a manual payment (admin only, calls RPC) */
export async function rejectPayment(orderId: string, reason?: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const { error } = await supabase.rpc('reject_manual_payment', {
    p_order_id: orderId,
    p_reason: reason || undefined,
  });

  if (error) { console.error('[payments] reject error:', error); return false; }
  return true;
}

/** Get all payments (admin) */
export async function adminGetAllPayments(): Promise<(Payment & { order?: { order_number: string; customer_name: string } })[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('payments')
    .select('*, order:orders(order_number, customer_name)')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[payments] adminGetAll error:', error);
    return [];
  }

  return (data ?? []) as any;
}

/** Get payments for a specific order */
export async function getPaymentsForOrder(orderId: string): Promise<Payment[]> {
  if (!isSupabaseConfigured) return [];

  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data ?? [];
}

/** 
 * Upload payment proof image — DISABLED for Phase 1.
 * Phase 1 uses TrxID-only manual verification.
 * Only admin can upload proofs on behalf of customers.
 */
export async function uploadPaymentProof(
  _orderId: string,
  _file: File
): Promise<string | null> {
  console.warn('[payments] Payment proof upload is disabled in Phase 1. Using TrxID-only verification.');
  return null;
}

/**
 * Admin: upload proof on behalf of a customer
 */
export async function adminUploadPaymentProof(
  orderId: string,
  file: File
): Promise<string | null> {
  if (!isSupabaseConfigured) return null;

  const ext = file.name.split('.').pop() ?? 'jpg';
  const path = `${orderId}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from('payment-proofs')
    .upload(path, file, { upsert: false });

  if (error) {
    console.error('[payments] admin upload proof error:', error);
    return null;
  }

  // Store the path reference (not a public URL — bucket is private)
  await supabase
    .from('payments')
    .update({ proof_image_url: path })
    .eq('order_id', orderId);

  return path;
}

/**
 * Admin: get a signed URL to view a payment proof (private bucket)
 */
export async function adminGetProofUrl(path: string): Promise<string | null> {
  if (!isSupabaseConfigured || !path) return null;

  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(path, 300); // 5 minute expiry

  if (error) {
    console.error('[payments] signed URL error:', error);
    return null;
  }
  return data.signedUrl;
}


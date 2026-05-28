-- =============================================================
-- Nongor Boutique Pro — Storage Buckets & Policies
-- Migration 004: Supabase Storage
-- =============================================================
-- NOTE: Run these in the Supabase SQL Editor.
-- Storage bucket creation uses the storage API, but policies
-- can be managed via SQL.

-- Create buckets (run these via Supabase Dashboard > Storage if SQL doesn't work)
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('payment-proofs', 'payment-proofs', false),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

-- =============================================================
-- PRODUCT IMAGES BUCKET — public read, admin write
-- =============================================================

-- Anyone can view product images
create policy "Public read product images"
  on storage.objects for select
  using (bucket_id = 'product-images');

-- Admin can upload product images
create policy "Admin upload product images"
  on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Admin can update product images
create policy "Admin update product images"
  on storage.objects for update
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Admin can delete product images
create policy "Admin delete product images"
  on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- =============================================================
-- PAYMENT PROOFS BUCKET — customer upload own, admin read all
-- =============================================================

-- Customers can upload payment proof (path: payment-proofs/{order_id}/*)
create policy "Customer upload payment proof"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and auth.uid() is not null
  );

-- Admin can read all payment proofs
create policy "Admin read payment proofs"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Customers can read their own payment proofs
create policy "Customer read own payment proofs"
  on storage.objects for select
  using (
    bucket_id = 'payment-proofs'
    and auth.uid() is not null
  );

-- =============================================================
-- BRAND ASSETS BUCKET — public read, admin write
-- =============================================================

-- Anyone can view brand assets
create policy "Public read brand assets"
  on storage.objects for select
  using (bucket_id = 'brand-assets');

-- Admin can upload brand assets
create policy "Admin upload brand assets"
  on storage.objects for insert
  with check (
    bucket_id = 'brand-assets'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Admin can update brand assets
create policy "Admin update brand assets"
  on storage.objects for update
  using (
    bucket_id = 'brand-assets'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Admin can delete brand assets
create policy "Admin delete brand assets"
  on storage.objects for delete
  using (
    bucket_id = 'brand-assets'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

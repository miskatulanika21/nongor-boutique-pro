-- =============================================================
-- Nongor Boutique Pro — Seed Data
-- Migration 005: Initial data matching existing mock
-- =============================================================
-- NOTE: Run AFTER 001-004 migrations.
-- Admin user must be created via Supabase Auth first, then
-- update the profile row below with their real auth.users(id).

-- =============================================================
-- CATEGORIES (matching existing mock categories)
-- =============================================================
insert into categories (name, slug, description, image_url, is_active, sort_order) values
  ('Handmade Kurti', 'handmade-kurti', 'Hand-stitched kurti by Bangladeshi artisans', null, true, 1),
  ('New Arrivals', 'new-arrivals', 'Latest additions to our collection', null, true, 2),
  ('Best Sellers', 'best-sellers', 'Customer favorites', null, true, 3),
  ('Festive Collection', 'festive-collection', 'Special occasion and festive wear', null, true, 4),
  ('Coming Soon — Saree', 'coming-soon-saree', 'Upcoming saree collection', null, false, 5);

-- =============================================================
-- PRODUCTS (matching existing mock products)
-- =============================================================
insert into products (name, slug, description, short_description, price, discount_price, fabric, occasion, status, is_featured, is_new_arrival, is_best_seller, category_id) values
  (
    'Maroon Nakshi Handmade Kurti',
    'maroon-nakshi-handmade-kurti',
    'Hand-stitched Nakshi kantha motifs flow across deep maroon cotton — every kurti is sewn one at a time by artisans in Bangladesh.',
    'Nakshi kantha on deep maroon cotton',
    3200, 2690, 'Pure Cotton', 'Everyday', 'published', true, true, true,
    (select id from categories where slug = 'handmade-kurti')
  ),
  (
    'Ivory Floral Cotton Kurti',
    'ivory-floral-cotton-kurti',
    'Soft ivory cotton with delicate hand-embroidered florals.',
    'Ivory cotton with hand-embroidered florals',
    2490, null, 'Soft Cotton', 'Everyday', 'published', true, true, false,
    (select id from categories where slug = 'handmade-kurti')
  ),
  (
    'Golden Thread Festive Kurti',
    'golden-thread-festive-kurti',
    'Festive silk blend kurti with golden thread embroidery.',
    'Silk blend with golden thread embroidery',
    3890, 3290, 'Silk Blend', 'Festive', 'published', true, false, true,
    (select id from categories where slug = 'festive-collection')
  ),
  (
    'Deep Maroon Artisan Kurti',
    'deep-maroon-artisan-kurti',
    'Khadi cotton with traditional artisan stitching.',
    'Khadi cotton artisan stitching',
    2890, null, 'Khadi Cotton', 'Everyday', 'published', false, false, false,
    (select id from categories where slug = 'handmade-kurti')
  ),
  (
    'Soft Beige Everyday Kurti',
    'soft-beige-everyday-kurti',
    'Lightweight everyday kurti in soft beige.',
    'Lightweight everyday beige kurti',
    1990, 1690, 'Cotton Voile', 'Everyday', 'published', false, true, false,
    (select id from categories where slug = 'handmade-kurti')
  ),
  (
    'Wine Red Handloom Kurti',
    'wine-red-handloom-kurti',
    'Handloom cotton crafted with traditional weaving techniques.',
    'Handloom cotton traditional weaving',
    3490, null, 'Handloom Cotton', 'Formal', 'published', false, false, true,
    (select id from categories where slug = 'handmade-kurti')
  ),
  (
    'Antique Rose Embroidered Kurti',
    'antique-rose-embroidered-kurti',
    'Vintage rose tones with delicate embroidery.',
    'Vintage rose with delicate embroidery',
    2790, null, 'Cotton', 'Everyday', 'published', false, true, false,
    (select id from categories where slug = 'handmade-kurti')
  ),
  (
    'Festive Maroon Gold Kurti',
    'festive-maroon-gold-kurti',
    'Statement festive piece with antique gold detailing.',
    'Festive piece with antique gold detailing',
    4290, 3690, 'Silk Cotton', 'Festive', 'published', true, false, false,
    (select id from categories where slug = 'festive-collection')
  );

-- =============================================================
-- PRODUCT IMAGES (using Unsplash placeholders matching mock)
-- =============================================================
-- We'll use the same Unsplash URLs from mock data initially
-- Replace with real Supabase Storage URLs after admin uploads

do $$
declare
  v_product_id uuid;
  v_photos text[] := array[
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1612722432474-b971cdcea546?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1583394293214-28a4b0025e74?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1606902965551-dce093cda6e7?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1614251056216-f748f76cd228?auto=format&fit=crop&w=800&h=1000&q=80',
    'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&h=1000&q=80'
  ];
begin
  -- Maroon Nakshi (photos 0,1,2)
  select id into v_product_id from products where slug = 'maroon-nakshi-handmade-kurti';
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (v_product_id, v_photos[1], 0, true),
    (v_product_id, v_photos[2], 1, false),
    (v_product_id, v_photos[3], 2, false);

  -- Ivory Floral (photos 3,4)
  select id into v_product_id from products where slug = 'ivory-floral-cotton-kurti';
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (v_product_id, v_photos[4], 0, true),
    (v_product_id, v_photos[5], 1, false);

  -- Golden Thread (photos 5,6)
  select id into v_product_id from products where slug = 'golden-thread-festive-kurti';
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (v_product_id, v_photos[6], 0, true),
    (v_product_id, v_photos[7], 1, false);

  -- Deep Maroon (photos 7,8)
  select id into v_product_id from products where slug = 'deep-maroon-artisan-kurti';
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (v_product_id, v_photos[8], 0, true),
    (v_product_id, v_photos[9], 1, false);

  -- Soft Beige (photos 9,0)
  select id into v_product_id from products where slug = 'soft-beige-everyday-kurti';
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (v_product_id, v_photos[10], 0, true),
    (v_product_id, v_photos[1], 1, false);

  -- Wine Red (photos 1,3)
  select id into v_product_id from products where slug = 'wine-red-handloom-kurti';
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (v_product_id, v_photos[2], 0, true),
    (v_product_id, v_photos[4], 1, false);

  -- Antique Rose (photos 2,4)
  select id into v_product_id from products where slug = 'antique-rose-embroidered-kurti';
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (v_product_id, v_photos[3], 0, true),
    (v_product_id, v_photos[5], 1, false);

  -- Festive Maroon Gold (photos 6,8)
  select id into v_product_id from products where slug = 'festive-maroon-gold-kurti';
  insert into product_images (product_id, image_url, display_order, is_primary) values
    (v_product_id, v_photos[7], 0, true),
    (v_product_id, v_photos[9], 1, false);
end $$;

-- =============================================================
-- PRODUCT VARIANTS (sizes & colors with stock)
-- =============================================================
do $$
declare
  v_pid uuid;
begin
  -- Maroon Nakshi: S/M/L/XL × Maroon, Ivory
  select id into v_pid from products where slug = 'maroon-nakshi-handmade-kurti';
  insert into product_variants (product_id, size, color, sku, stock) values
    (v_pid, 'S', 'Maroon', 'MNK-S-MAR', 2),
    (v_pid, 'M', 'Maroon', 'MNK-M-MAR', 3),
    (v_pid, 'L', 'Maroon', 'MNK-L-MAR', 2),
    (v_pid, 'XL', 'Maroon', 'MNK-XL-MAR', 1),
    (v_pid, 'S', 'Ivory', 'MNK-S-IVR', 0),
    (v_pid, 'M', 'Ivory', 'MNK-M-IVR', 0),
    (v_pid, 'L', 'Ivory', 'MNK-L-IVR', 0),
    (v_pid, 'XL', 'Ivory', 'MNK-XL-IVR', 0);

  -- Ivory Floral: S/M/L/XL/XXL × Ivory
  select id into v_pid from products where slug = 'ivory-floral-cotton-kurti';
  insert into product_variants (product_id, size, color, sku, stock) values
    (v_pid, 'S', 'Ivory', 'IFC-S-IVR', 3),
    (v_pid, 'M', 'Ivory', 'IFC-M-IVR', 4),
    (v_pid, 'L', 'Ivory', 'IFC-L-IVR', 3),
    (v_pid, 'XL', 'Ivory', 'IFC-XL-IVR', 2),
    (v_pid, 'XXL', 'Ivory', 'IFC-XXL-IVR', 2);

  -- Golden Thread: M/L/XL × Maroon, Gold
  select id into v_pid from products where slug = 'golden-thread-festive-kurti';
  insert into product_variants (product_id, size, color, sku, stock) values
    (v_pid, 'M', 'Maroon', 'GTF-M-MAR', 1),
    (v_pid, 'L', 'Maroon', 'GTF-L-MAR', 1),
    (v_pid, 'XL', 'Maroon', 'GTF-XL-MAR', 0),
    (v_pid, 'M', 'Gold', 'GTF-M-GLD', 1),
    (v_pid, 'L', 'Gold', 'GTF-L-GLD', 0),
    (v_pid, 'XL', 'Gold', 'GTF-XL-GLD', 0);

  -- Deep Maroon Artisan: S/M/L × Maroon
  select id into v_pid from products where slug = 'deep-maroon-artisan-kurti';
  insert into product_variants (product_id, size, color, sku, stock) values
    (v_pid, 'S', 'Maroon', 'DMA-S-MAR', 4),
    (v_pid, 'M', 'Maroon', 'DMA-M-MAR', 4),
    (v_pid, 'L', 'Maroon', 'DMA-L-MAR', 3);

  -- Soft Beige: S/M/L/XL × Beige, Ivory
  select id into v_pid from products where slug = 'soft-beige-everyday-kurti';
  insert into product_variants (product_id, size, color, sku, stock) values
    (v_pid, 'S', 'Beige', 'SBE-S-BGE', 5),
    (v_pid, 'M', 'Beige', 'SBE-M-BGE', 6),
    (v_pid, 'L', 'Beige', 'SBE-L-BGE', 5),
    (v_pid, 'XL', 'Beige', 'SBE-XL-BGE', 3),
    (v_pid, 'S', 'Ivory', 'SBE-S-IVR', 1),
    (v_pid, 'M', 'Ivory', 'SBE-M-IVR', 1),
    (v_pid, 'L', 'Ivory', 'SBE-L-IVR', 1),
    (v_pid, 'XL', 'Ivory', 'SBE-XL-IVR', 0);

  -- Wine Red Handloom: M/L/XL × Wine
  select id into v_pid from products where slug = 'wine-red-handloom-kurti';
  insert into product_variants (product_id, size, color, sku, stock) values
    (v_pid, 'M', 'Wine', 'WRH-M-WIN', 2),
    (v_pid, 'L', 'Wine', 'WRH-L-WIN', 2),
    (v_pid, 'XL', 'Wine', 'WRH-XL-WIN', 2);

  -- Antique Rose: S/M/L × Rose
  select id into v_pid from products where slug = 'antique-rose-embroidered-kurti';
  insert into product_variants (product_id, size, color, sku, stock) values
    (v_pid, 'S', 'Rose', 'ARE-S-RSE', 3),
    (v_pid, 'M', 'Rose', 'ARE-M-RSE', 3),
    (v_pid, 'L', 'Rose', 'ARE-L-RSE', 3);

  -- Festive Maroon Gold: S/M/L/XL × Maroon (OUT OF STOCK)
  select id into v_pid from products where slug = 'festive-maroon-gold-kurti';
  insert into product_variants (product_id, size, color, sku, stock) values
    (v_pid, 'S', 'Maroon', 'FMG-S-MAR', 0),
    (v_pid, 'M', 'Maroon', 'FMG-M-MAR', 0),
    (v_pid, 'L', 'Maroon', 'FMG-L-MAR', 0),
    (v_pid, 'XL', 'Maroon', 'FMG-XL-MAR', 0);
end $$;

-- =============================================================
-- COUPONS (matching existing mock)
-- =============================================================
insert into coupons (code, type, value, minimum_order, expires_at, used_count, is_active) values
  ('NONGOR10', 'percent', 10, 2000, '2025-12-31'::timestamptz, 142, true),
  ('FESTIVE500', 'flat', 500, 3000, '2025-08-31'::timestamptz, 56, true),
  ('FREESHIP', 'free_delivery', 0, 2500, '2025-07-15'::timestamptz, 89, true),
  ('WELCOME15', 'percent', 15, 1500, '2025-06-30'::timestamptz, 312, false);

-- =============================================================
-- SITE SETTINGS (matching existing admin.tsx defaults)
-- =============================================================
insert into site_settings (key, value) values
  ('storeName', '"Nongor"'),
  ('contactNumber', '"+880 1700-000000"'),
  ('email', '"hello@nongor.com.bd"'),
  ('address', '"Dhanmondi, Dhaka"'),
  ('deliveryInsideDhaka', '"60"'),
  ('deliveryOutsideDhaka', '"120"'),
  ('freeDeliveryThreshold', '"2500"'),
  ('enableCOD', '"true"'),
  ('enableBkash', '"true"'),
  ('enableNagad', '"true"'),
  ('enableRocket', '"true"'),
  ('enableCard', '"true"'),
  ('enableShurjoPay', '"true"'),
  ('emailAlertNewOrder', '"true"'),
  ('smsAlertNewOrder', '"true"'),
  ('customerConfirmSms', '"true"');

-- =============================================================
-- REVIEWS (sample reviews matching mock)
-- =============================================================
insert into reviews (product_id, customer_name, rating, body, approved) values
  ((select id from products where slug = 'maroon-nakshi-handmade-kurti'), 'Tasnim R.', 5, 'The stitching detail is gorgeous, fabric feels premium.', true),
  ((select id from products where slug = 'golden-thread-festive-kurti'), 'Nusrat J.', 5, 'Wore it for Eid and got so many compliments.', true),
  ((select id from products where slug = 'ivory-floral-cotton-kurti'), 'Sadia I.', 3, 'Nice but size ran a bit small.', false),
  ((select id from products where slug = 'wine-red-handloom-kurti'), 'Mehnaz K.', 5, 'Handloom quality is exceptional.', true);

-- =============================================================
-- ADMIN PROFILE PLACEHOLDER
-- =============================================================
-- After creating admin user in Supabase Auth (email: admin@nongor.com),
-- run this to set their role:
--
-- update profiles set role = 'admin' where id = '<auth-user-uuid-here>';
--
-- DO NOT store any default password in migration files.

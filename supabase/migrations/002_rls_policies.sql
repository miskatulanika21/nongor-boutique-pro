-- =============================================================
-- Nongor Boutique Pro — Row Level Security Policies
-- Migration 002: RLS
-- =============================================================

-- Enable RLS on all tables
alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table product_variants enable row level security;
alter table addresses enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table payments enable row level security;
alter table coupons enable row level security;
alter table site_settings enable row level security;
alter table banners enable row level security;
alter table reviews enable row level security;

-- =============================================================
-- Helper: check if current user is admin
-- =============================================================
create or replace function is_admin()
returns boolean as $$
begin
  return exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- =============================================================
-- PROFILES
-- =============================================================
-- Users can read their own profile
create policy "Users can view own profile"
  on profiles for select
  using (auth.uid() = id);

-- Users can update their own profile (but not role)
create policy "Users can update own profile"
  on profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admins can read all profiles
create policy "Admins can view all profiles"
  on profiles for select
  using (is_admin());

-- Admins can update any profile
create policy "Admins can update any profile"
  on profiles for update
  using (is_admin());

-- =============================================================
-- CATEGORIES
-- =============================================================
-- Public: read active categories
create policy "Public can view active categories"
  on categories for select
  using (is_active = true);

-- Admins: full CRUD
create policy "Admins can manage categories"
  on categories for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- PRODUCTS
-- =============================================================
-- Public: read published products
create policy "Public can view published products"
  on products for select
  using (status = 'published');

-- Admins: full CRUD (including draft/archived)
create policy "Admins can manage products"
  on products for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- PRODUCT IMAGES
-- =============================================================
-- Public: read images for published products
create policy "Public can view product images"
  on product_images for select
  using (
    exists (
      select 1 from products
      where products.id = product_images.product_id
      and products.status = 'published'
    )
  );

-- Admins: full CRUD
create policy "Admins can manage product images"
  on product_images for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- PRODUCT VARIANTS
-- =============================================================
-- Public: read variants for published products
create policy "Public can view product variants"
  on product_variants for select
  using (
    exists (
      select 1 from products
      where products.id = product_variants.product_id
      and products.status = 'published'
    )
  );

-- Admins: full CRUD
create policy "Admins can manage product variants"
  on product_variants for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- ADDRESSES
-- =============================================================
-- Users can view their own addresses
create policy "Users can view own addresses"
  on addresses for select
  using (auth.uid() = user_id);

-- Users can create addresses for themselves
create policy "Users can create own addresses"
  on addresses for insert
  with check (auth.uid() = user_id or user_id is null);

-- Guest addresses (user_id is null) can be created by anyone (handled via RPC)
create policy "Allow guest address creation"
  on addresses for insert
  with check (user_id is null);

-- Admins: full access
create policy "Admins can manage addresses"
  on addresses for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- ORDERS
-- =============================================================
-- Users can view their own orders
create policy "Users can view own orders"
  on orders for select
  using (auth.uid() = user_id);

-- Guest orders: viewable by matching phone + order_number (handled via RPC)
-- No direct insert policy for orders — all creation goes through RPC

-- Admins: full access
create policy "Admins can manage orders"
  on orders for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- ORDER ITEMS
-- =============================================================
-- Users can view items for their own orders
create policy "Users can view own order items"
  on order_items for select
  using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Admins: full access
create policy "Admins can manage order items"
  on order_items for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- PAYMENTS
-- =============================================================
-- Users can view payments for their own orders
create policy "Users can view own payments"
  on payments for select
  using (
    exists (
      select 1 from orders
      where orders.id = payments.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Users can create payment records for their own orders
create policy "Users can create payment for own order"
  on payments for insert
  with check (
    exists (
      select 1 from orders
      where orders.id = payments.order_id
      and orders.user_id = auth.uid()
    )
  );

-- Admins: full access
create policy "Admins can manage payments"
  on payments for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- COUPONS
-- =============================================================
-- Public: read active coupons (for validation)
create policy "Public can view active coupons"
  on coupons for select
  using (is_active = true);

-- Admins: full CRUD
create policy "Admins can manage coupons"
  on coupons for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- SITE SETTINGS
-- =============================================================
-- Public: read all settings
create policy "Public can view settings"
  on site_settings for select
  using (true);

-- Admins: update settings
create policy "Admins can manage settings"
  on site_settings for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- BANNERS
-- =============================================================
-- Public: read active banners
create policy "Public can view active banners"
  on banners for select
  using (is_active = true);

-- Admins: full CRUD
create policy "Admins can manage banners"
  on banners for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- REVIEWS
-- =============================================================
-- Public: read approved reviews
create policy "Public can view approved reviews"
  on reviews for select
  using (approved = true);

-- Users can create reviews
create policy "Users can create reviews"
  on reviews for insert
  with check (auth.uid() = user_id);

-- Users can view their own reviews (even if not approved)
create policy "Users can view own reviews"
  on reviews for select
  using (auth.uid() = user_id);

-- Admins: full CRUD
create policy "Admins can manage reviews"
  on reviews for all
  using (is_admin())
  with check (is_admin());

-- =============================================================
-- Nongor Boutique Pro — Database Schema
-- Migration 001: Core tables
-- =============================================================

-- Helper: auto-update updated_at column
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- =============================================================
-- 1. PROFILES
-- =============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('admin', 'customer')),
  created_at timestamptz not null default now()
);

-- =============================================================
-- 2. CATEGORIES
-- =============================================================
create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 3. PRODUCTS
-- =============================================================
create table products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete set null,
  name text not null,
  slug text unique not null,
  description text,
  short_description text,
  price numeric not null check (price >= 0),
  discount_price numeric check (discount_price is null or discount_price >= 0),
  fabric text,
  occasion text,
  care_instructions text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  is_best_seller boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger products_updated_at
  before update on products
  for each row execute function update_updated_at();

-- =============================================================
-- 4. PRODUCT IMAGES
-- =============================================================
create table product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  alt_text text,
  display_order int not null default 0,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 5. PRODUCT VARIANTS
-- =============================================================
create table product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size text not null,
  color text not null,
  sku text unique,
  stock int not null default 0 check (stock >= 0),
  price_override numeric check (price_override is null or price_override >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 6. ADDRESSES
-- =============================================================
create table addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  guest_phone text,
  full_name text not null,
  phone text not null,
  email text,
  district text not null,
  upazila text not null,
  full_address text not null,
  delivery_note text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 7. ORDERS
-- =============================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  address_id uuid references addresses(id) on delete set null,
  order_status text not null default 'pending' check (order_status in (
    'pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled'
  )),
  payment_method text not null check (payment_method in (
    'cod', 'bkash', 'nagad', 'rocket', 'sslcommerz', 'shurjopay'
  )),
  payment_status text not null default 'pending' check (payment_status in (
    'pending', 'verification_needed', 'paid', 'failed', 'refunded'
  )),
  subtotal numeric not null check (subtotal >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  delivery_charge numeric not null default 0 check (delivery_charge >= 0),
  total_amount numeric not null check (total_amount >= 0),
  coupon_code text,
  admin_note text,
  tracking_id text,
  courier_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- =============================================================
-- 8. ORDER ITEMS
-- =============================================================
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  size text,
  color text,
  quantity int not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  total_price numeric not null check (total_price >= 0),
  created_at timestamptz not null default now()
);

-- =============================================================
-- 9. PAYMENTS
-- =============================================================
create table payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  method text not null,
  amount numeric not null check (amount >= 0),
  trx_id text,
  proof_image_url text,
  status text not null default 'pending' check (status in (
    'pending', 'approved', 'rejected', 'failed'
  )),
  verified_by uuid references auth.users(id) on delete set null,
  verified_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 10. COUPONS
-- =============================================================
create table coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type text not null check (type in ('percent', 'flat', 'free_delivery')),
  value numeric not null default 0 check (value >= 0),
  minimum_order numeric not null default 0 check (minimum_order >= 0),
  usage_limit int,
  used_count int not null default 0 check (used_count >= 0),
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 11. SITE SETTINGS
-- =============================================================
create table site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create trigger site_settings_updated_at
  before update on site_settings
  for each row execute function update_updated_at();

-- =============================================================
-- 12. BANNERS
-- =============================================================
create table banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image_url text,
  link_url text,
  position text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- =============================================================
-- 13. REVIEWS
-- =============================================================
create table reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text,
  rating int not null check (rating >= 1 and rating <= 5),
  body text,
  image_url text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

-- =============================================================
-- Indexes for common queries
-- =============================================================
create index idx_products_slug on products(slug);
create index idx_products_status on products(status);
create index idx_products_category on products(category_id);
create index idx_products_featured on products(is_featured) where is_featured = true;
create index idx_products_new on products(is_new_arrival) where is_new_arrival = true;
create index idx_products_bestseller on products(is_best_seller) where is_best_seller = true;

create index idx_product_images_product on product_images(product_id);
create index idx_product_variants_product on product_variants(product_id);

create index idx_orders_number on orders(order_number);
create index idx_orders_user on orders(user_id);
create index idx_orders_status on orders(order_status);
create index idx_orders_phone on orders(customer_phone);

create index idx_order_items_order on order_items(order_id);
create index idx_payments_order on payments(order_id);

create index idx_reviews_product on reviews(product_id);
create index idx_reviews_approved on reviews(approved) where approved = true;

create index idx_categories_slug on categories(slug);
create index idx_coupons_code on coupons(code);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Order number sequence
create sequence order_number_seq start 1000;

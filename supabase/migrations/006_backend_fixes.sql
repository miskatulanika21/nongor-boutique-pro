-- =============================================================
-- Nongor Boutique Pro — Backend Integration Fixes
-- Migration 006: Incremental fixes on top of 001-005
-- Run this in Supabase SQL Editor AFTER 001-005.
-- =============================================================

-- =============================================================
-- FIX 1: Profiles column-level security trigger
-- Prevents non-admin users from changing their own role.
-- =============================================================

create or replace function enforce_profile_update_rules()
returns trigger as $$
begin
  -- If the caller is NOT an admin, block role/id changes
  if not is_admin() then
    if new.role is distinct from old.role then
      raise exception 'Permission denied: only admins can change user roles';
    end if;
    if new.id is distinct from old.id then
      raise exception 'Permission denied: cannot change profile id';
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it already exists (idempotent)
drop trigger if exists trg_enforce_profile_update on profiles;
create trigger trg_enforce_profile_update
  before update on profiles
  for each row execute function enforce_profile_update_rules();

-- =============================================================
-- FIX 2: Secure create_order_with_items RPC
-- - Do NOT trust frontend pricing/subtotal/total
-- - Resolve variant_id from product_id + size + color if missing
-- - Calculate price from DB (product.discount_price or price, then variant.price_override)
-- - Validate coupon server-side (expiry, active, min order, usage limit)
-- - Validate delivery charge from site_settings
-- - Atomic conditional stock deduction (UPDATE WHERE stock >= qty)
-- - Return order_number and order_id
-- =============================================================

create or replace function create_order_with_items(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text default null,
  p_district text default null,
  p_upazila text default null,
  p_full_address text default null,
  p_delivery_note text default null,
  p_payment_method text default 'cod',
  p_trx_id text default null,
  p_subtotal numeric default 0,        -- ignored, recalculated
  p_discount_amount numeric default 0,  -- ignored, recalculated
  p_delivery_charge numeric default 0,  -- ignored, recalculated
  p_total_amount numeric default 0,     -- ignored, recalculated
  p_coupon_code text default null,
  p_items jsonb default '[]'::jsonb
  -- items format: [{"product_id": "uuid", "variant_id": "uuid"|null, "product_name": "...", "size": "M", "color": "Maroon", "quantity": 1, "unit_price": 0}]
)
returns jsonb as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_address_id uuid;
  v_user_id uuid;
  v_item jsonb;
  v_seq_num int;
  -- pricing
  v_resolved_variant_id uuid;
  v_db_price numeric;
  v_item_total numeric;
  v_subtotal numeric := 0;
  v_discount_amount numeric := 0;
  v_delivery_charge numeric := 0;
  v_total_amount numeric := 0;
  -- coupon
  v_coupon record;
  -- delivery settings
  v_setting_val jsonb;
  v_free_threshold numeric := 0;
  v_dhaka_charge numeric := 60;
  v_outside_charge numeric := 120;
  -- stock
  v_stock_after int;
begin
  -- Get current user (null for guest checkout)
  v_user_id := auth.uid();

  -- Validate items array is not empty
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- ─── STEP 1: Resolve variants, prices, and deduct stock atomically ───
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- Resolve variant_id if missing: look up by product_id + size + color
    if v_item->>'variant_id' is not null and v_item->>'variant_id' <> '' then
      v_resolved_variant_id := (v_item->>'variant_id')::uuid;
    else
      select id into v_resolved_variant_id
      from product_variants
      where product_id = (v_item->>'product_id')::uuid
        and size = v_item->>'size'
        and color = v_item->>'color'
        and is_active = true;

      if v_resolved_variant_id is null then
        raise exception 'No active variant found for product % size % color %',
          v_item->>'product_id', v_item->>'size', v_item->>'color';
      end if;
    end if;

    -- Look up the real price from DB: prefer variant.price_override, else product.discount_price, else product.price
    select
      coalesce(pv.price_override, p.discount_price, p.price)
    into v_db_price
    from product_variants pv
    join products p on p.id = pv.product_id
    where pv.id = v_resolved_variant_id
      and pv.is_active = true;

    if v_db_price is null then
      raise exception 'Variant % not found or inactive', v_resolved_variant_id;
    end if;

    -- Atomic conditional stock deduction
    update product_variants
    set stock = stock - (v_item->>'quantity')::int
    where id = v_resolved_variant_id
      and stock >= (v_item->>'quantity')::int
    returning stock into v_stock_after;

    if v_stock_after is null then
      raise exception 'Insufficient stock for % (size: %, color: %)',
        v_item->>'product_name', v_item->>'size', v_item->>'color';
    end if;

    -- Accumulate subtotal using server-side price
    v_item_total := v_db_price * (v_item->>'quantity')::int;
    v_subtotal := v_subtotal + v_item_total;

    -- Store resolved info back into the item for insertion
    -- (We'll use v_resolved_variant_id and v_db_price in the insert below)
  end loop;

  -- ─── STEP 2: Validate coupon server-side ───
  if p_coupon_code is not null and p_coupon_code <> '' then
    select * into v_coupon
    from coupons
    where code = upper(p_coupon_code)
      and is_active = true;

    if v_coupon is null then
      raise exception 'Invalid coupon code: %', p_coupon_code;
    end if;

    -- Check expiry
    if v_coupon.expires_at is not null and v_coupon.expires_at < now() then
      raise exception 'Coupon % has expired', p_coupon_code;
    end if;

    -- Check start date
    if v_coupon.starts_at is not null and v_coupon.starts_at > now() then
      raise exception 'Coupon % is not active yet', p_coupon_code;
    end if;

    -- Check minimum order
    if v_subtotal < v_coupon.minimum_order then
      raise exception 'Minimum order of ৳% required for coupon %', v_coupon.minimum_order, p_coupon_code;
    end if;

    -- Check usage limit
    if v_coupon.usage_limit is not null and v_coupon.used_count >= v_coupon.usage_limit then
      raise exception 'Coupon % has reached its usage limit', p_coupon_code;
    end if;

    -- Calculate discount
    if v_coupon.type = 'percent' then
      v_discount_amount := round(v_subtotal * v_coupon.value / 100);
    elsif v_coupon.type = 'flat' then
      v_discount_amount := v_coupon.value;
    elsif v_coupon.type = 'free_delivery' then
      v_discount_amount := 0; -- delivery handled below
    end if;
  end if;

  -- ─── STEP 3: Calculate delivery charge from site_settings ───
  -- Read delivery settings
  select value into v_setting_val from site_settings where key = 'freeDeliveryThreshold';
  if v_setting_val is not null then
    v_free_threshold := trim(both '"' from v_setting_val::text)::numeric;
  end if;

  select value into v_setting_val from site_settings where key = 'deliveryInsideDhaka';
  if v_setting_val is not null then
    v_dhaka_charge := trim(both '"' from v_setting_val::text)::numeric;
  end if;

  select value into v_setting_val from site_settings where key = 'deliveryOutsideDhaka';
  if v_setting_val is not null then
    v_outside_charge := trim(both '"' from v_setting_val::text)::numeric;
  end if;

  -- Determine delivery charge
  if v_coupon is not null and v_coupon.type = 'free_delivery' then
    v_delivery_charge := 0;
  elsif v_free_threshold > 0 and v_subtotal >= v_free_threshold then
    v_delivery_charge := 0;
  elsif lower(coalesce(p_district, '')) like '%dhaka%' then
    v_delivery_charge := v_dhaka_charge;
  else
    v_delivery_charge := v_outside_charge;
  end if;

  -- ─── STEP 4: Calculate total ───
  v_total_amount := v_subtotal - v_discount_amount + v_delivery_charge;
  if v_total_amount < 0 then v_total_amount := 0; end if;

  -- ─── STEP 5: Generate order number ───
  v_seq_num := nextval('order_number_seq');
  v_order_number := 'NGR-' || lpad(v_seq_num::text, 6, '0');

  -- ─── STEP 6: Create address ───
  insert into addresses (user_id, guest_phone, full_name, phone, email, district, upazila, full_address, delivery_note)
  values (
    v_user_id,
    case when v_user_id is null then p_customer_phone else null end,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    coalesce(p_district, ''),
    coalesce(p_upazila, ''),
    coalesce(p_full_address, ''),
    p_delivery_note
  )
  returning id into v_address_id;

  -- ─── STEP 7: Create order ───
  insert into orders (
    order_number, user_id, customer_name, customer_phone, customer_email,
    address_id, payment_method, payment_status, order_status,
    subtotal, discount_amount, delivery_charge, total_amount, coupon_code
  ) values (
    v_order_number,
    v_user_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    v_address_id,
    p_payment_method,
    case
      when p_payment_method = 'cod' then 'pending'
      when p_payment_method in ('bkash', 'nagad', 'rocket') then 'verification_needed'
      else 'pending'
    end,
    'pending',
    v_subtotal,
    v_discount_amount,
    v_delivery_charge,
    v_total_amount,
    p_coupon_code
  )
  returning id into v_order_id;

  -- ─── STEP 8: Create order items (re-loop with server prices) ───
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    -- Re-resolve variant_id (same logic as above)
    if v_item->>'variant_id' is not null and v_item->>'variant_id' <> '' then
      v_resolved_variant_id := (v_item->>'variant_id')::uuid;
    else
      select id into v_resolved_variant_id
      from product_variants
      where product_id = (v_item->>'product_id')::uuid
        and size = v_item->>'size'
        and color = v_item->>'color'
        and is_active = true;
    end if;

    -- Get DB price again for this item
    select coalesce(pv.price_override, p.discount_price, p.price)
    into v_db_price
    from product_variants pv
    join products p on p.id = pv.product_id
    where pv.id = v_resolved_variant_id;

    insert into order_items (
      order_id, product_id, variant_id, product_name,
      size, color, quantity, unit_price, total_price
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      v_resolved_variant_id,
      v_item->>'product_name',
      v_item->>'size',
      v_item->>'color',
      (v_item->>'quantity')::int,
      v_db_price,
      (v_item->>'quantity')::int * v_db_price
    );
  end loop;

  -- ─── STEP 9: Create payment record for mobile banking ───
  if p_payment_method in ('bkash', 'nagad', 'rocket') then
    insert into payments (order_id, method, amount, trx_id, status)
    values (
      v_order_id,
      p_payment_method,
      v_total_amount,
      p_trx_id,
      'pending'
    );
  end if;

  -- ─── STEP 10: Increment coupon usage ───
  if p_coupon_code is not null and p_coupon_code <> '' then
    update coupons
    set used_count = used_count + 1
    where code = upper(p_coupon_code);
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount_amount', v_discount_amount,
    'delivery_charge', v_delivery_charge,
    'total_amount', v_total_amount
  );
end;
$$ language plpgsql security definer;

-- =============================================================
-- FIX 3: Tighten payment-proofs storage policies
-- Phase 1: TrxID-only verification, no open upload.
-- Remove the old permissive customer upload policy.
-- Admin uploads proofs on behalf of customers if needed.
-- =============================================================

-- Drop old permissive insert policy for payment-proofs
drop policy if exists "Customer upload payment proof" on storage.objects;

-- Drop old permissive select policy for customers
drop policy if exists "Customer read own payment proofs" on storage.objects;

-- Admin-only upload for payment proofs (no open anonymous/customer insert)
create policy "Admin upload payment proofs"
  on storage.objects for insert
  with check (
    bucket_id = 'payment-proofs'
    and exists (
      select 1 from profiles
      where id = auth.uid()
      and role = 'admin'
    )
  );

-- Admin can already read via existing "Admin read payment proofs" policy
-- No changes needed there.

-- =============================================================
-- FIX 4: Update coupon expiry dates to the future
-- =============================================================

update coupons set expires_at = now() + interval '6 months'
where code = 'NONGOR10';

update coupons set expires_at = now() + interval '6 months'
where code = 'FESTIVE500';

update coupons set expires_at = now() + interval '6 months'
where code = 'FREESHIP';

update coupons set expires_at = now() + interval '3 months'
where code = 'WELCOME15';

-- =============================================================
-- Done! All backend integration fixes applied.
-- =============================================================

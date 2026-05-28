-- =============================================================
-- Nongor Boutique Pro — RPC Functions
-- Migration 003: Server-side business logic
-- =============================================================

-- =============================================================
-- 1. CREATE ORDER WITH ITEMS (atomic transaction)
-- Supports both authenticated and guest checkout
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
  p_subtotal numeric default 0,
  p_discount_amount numeric default 0,
  p_delivery_charge numeric default 0,
  p_total_amount numeric default 0,
  p_coupon_code text default null,
  p_items jsonb default '[]'::jsonb
  -- items format: [{"product_id": "uuid", "variant_id": "uuid", "product_name": "...", "size": "M", "color": "Maroon", "quantity": 1, "unit_price": 2690}]
)
returns jsonb as $$
declare
  v_order_id uuid;
  v_order_number text;
  v_address_id uuid;
  v_user_id uuid;
  v_item jsonb;
  v_variant_stock int;
  v_seq_num int;
begin
  -- Get current user (null for guest checkout)
  v_user_id := auth.uid();

  -- Validate items array is not empty
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Order must contain at least one item';
  end if;

  -- Validate stock for all items FIRST
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    if v_item->>'variant_id' is not null then
      select stock into v_variant_stock
      from product_variants
      where id = (v_item->>'variant_id')::uuid
      and is_active = true;

      if v_variant_stock is null then
        raise exception 'Variant not found or inactive: %', v_item->>'variant_id';
      end if;

      if v_variant_stock < (v_item->>'quantity')::int then
        raise exception 'Insufficient stock for %s (requested: %, available: %)',
          v_item->>'product_name', v_item->>'quantity', v_variant_stock;
      end if;
    end if;
  end loop;

  -- Generate order number: NGR-000001
  v_seq_num := nextval('order_number_seq');
  v_order_number := 'NGR-' || lpad(v_seq_num::text, 6, '0');

  -- Create address
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

  -- Determine payment status
  -- COD → pending, mobile banking → verification_needed
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
    p_subtotal,
    p_discount_amount,
    p_delivery_charge,
    p_total_amount,
    p_coupon_code
  )
  returning id into v_order_id;

  -- Create order items and decrement stock
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into order_items (
      order_id, product_id, variant_id, product_name,
      size, color, quantity, unit_price, total_price
    ) values (
      v_order_id,
      (v_item->>'product_id')::uuid,
      case when v_item->>'variant_id' is not null then (v_item->>'variant_id')::uuid else null end,
      v_item->>'product_name',
      v_item->>'size',
      v_item->>'color',
      (v_item->>'quantity')::int,
      (v_item->>'unit_price')::numeric,
      (v_item->>'quantity')::int * (v_item->>'unit_price')::numeric
    );

    -- Decrement stock atomically
    if v_item->>'variant_id' is not null then
      update product_variants
      set stock = stock - (v_item->>'quantity')::int
      where id = (v_item->>'variant_id')::uuid;
    end if;
  end loop;

  -- Create payment record for mobile banking methods
  if p_payment_method in ('bkash', 'nagad', 'rocket') then
    insert into payments (order_id, method, amount, trx_id, status)
    values (
      v_order_id,
      p_payment_method,
      p_total_amount,
      p_trx_id,
      'pending'
    );
  end if;

  -- Increment coupon usage if used
  if p_coupon_code is not null then
    update coupons
    set used_count = used_count + 1
    where code = p_coupon_code;
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number
  );
end;
$$ language plpgsql security definer;

-- =============================================================
-- 2. APPROVE MANUAL PAYMENT (admin only)
-- =============================================================
create or replace function approve_manual_payment(
  p_order_id uuid
)
returns jsonb as $$
declare
  v_admin_id uuid;
begin
  v_admin_id := auth.uid();

  -- Verify admin role
  if not is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  -- Update payment
  update payments
  set status = 'approved',
      verified_by = v_admin_id,
      verified_at = now()
  where order_id = p_order_id
  and status in ('pending', 'rejected');

  -- Update order
  update orders
  set payment_status = 'paid',
      order_status = case
        when order_status = 'pending' then 'confirmed'
        else order_status
      end
  where id = p_order_id;

  return jsonb_build_object('success', true, 'order_id', p_order_id);
end;
$$ language plpgsql security definer;

-- =============================================================
-- 3. REJECT MANUAL PAYMENT (admin only)
-- =============================================================
create or replace function reject_manual_payment(
  p_order_id uuid,
  p_reason text default null
)
returns jsonb as $$
declare
  v_admin_id uuid;
begin
  v_admin_id := auth.uid();

  -- Verify admin role
  if not is_admin() then
    raise exception 'Unauthorized: admin access required';
  end if;

  -- Update payment
  update payments
  set status = 'rejected',
      verified_by = v_admin_id,
      verified_at = now(),
      rejection_reason = p_reason
  where order_id = p_order_id
  and status = 'pending';

  -- Update order
  update orders
  set payment_status = 'failed'
  where id = p_order_id;

  return jsonb_build_object('success', true, 'order_id', p_order_id);
end;
$$ language plpgsql security definer;

-- =============================================================
-- 4. TRACK ORDER (public, by order number + phone)
-- =============================================================
create or replace function track_order(
  p_order_number text,
  p_phone text
)
returns jsonb as $$
declare
  v_order record;
begin
  select
    o.order_number, o.order_status, o.payment_status, o.payment_method,
    o.total_amount, o.delivery_charge, o.courier_name, o.tracking_id,
    o.created_at, o.customer_name
  into v_order
  from orders o
  where o.order_number = p_order_number
  and o.customer_phone = p_phone;

  if v_order is null then
    return jsonb_build_object('found', false);
  end if;

  return jsonb_build_object(
    'found', true,
    'order_number', v_order.order_number,
    'customer_name', v_order.customer_name,
    'order_status', v_order.order_status,
    'payment_status', v_order.payment_status,
    'payment_method', v_order.payment_method,
    'total_amount', v_order.total_amount,
    'delivery_charge', v_order.delivery_charge,
    'courier_name', v_order.courier_name,
    'tracking_id', v_order.tracking_id,
    'created_at', v_order.created_at
  );
end;
$$ language plpgsql security definer;

-- Grant execute permissions
grant execute on function create_order_with_items to anon, authenticated;
grant execute on function approve_manual_payment to authenticated;
grant execute on function reject_manual_payment to authenticated;
grant execute on function track_order to anon, authenticated;

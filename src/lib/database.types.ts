/**
 * Nongor Boutique Pro — Supabase Database Types
 * Generated from schema in supabase/migrations/001_schema.sql
 *
 * These types match the Supabase table structure exactly.
 * Regenerate with `npx supabase gen types typescript` when schema changes.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          phone: string | null;
          role: 'admin' | 'customer';
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'customer';
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          phone?: string | null;
          role?: 'admin' | 'customer';
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image_url: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image_url?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          category_id: string | null;
          name: string;
          slug: string;
          description: string | null;
          short_description: string | null;
          price: number;
          discount_price: number | null;
          fabric: string | null;
          occasion: string | null;
          care_instructions: string | null;
          status: 'draft' | 'published' | 'archived';
          is_featured: boolean;
          is_new_arrival: boolean;
          is_best_seller: boolean;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id?: string | null;
          name: string;
          slug: string;
          description?: string | null;
          short_description?: string | null;
          price: number;
          discount_price?: number | null;
          fabric?: string | null;
          occasion?: string | null;
          care_instructions?: string | null;
          status?: 'draft' | 'published' | 'archived';
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_best_seller?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string | null;
          name?: string;
          slug?: string;
          description?: string | null;
          short_description?: string | null;
          price?: number;
          discount_price?: number | null;
          fabric?: string | null;
          occasion?: string | null;
          care_instructions?: string | null;
          status?: 'draft' | 'published' | 'archived';
          is_featured?: boolean;
          is_new_arrival?: boolean;
          is_best_seller?: boolean;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          image_url: string;
          alt_text: string | null;
          display_order: number;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          image_url: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          image_url?: string;
          alt_text?: string | null;
          display_order?: number;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          size: string;
          color: string;
          sku: string | null;
          stock: number;
          price_override: number | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          size: string;
          color: string;
          sku?: string | null;
          stock?: number;
          price_override?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          size?: string;
          color?: string;
          sku?: string | null;
          stock?: number;
          price_override?: number | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      addresses: {
        Row: {
          id: string;
          user_id: string | null;
          guest_phone: string | null;
          full_name: string;
          phone: string;
          email: string | null;
          district: string;
          upazila: string;
          full_address: string;
          delivery_note: string | null;
          is_default: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          guest_phone?: string | null;
          full_name: string;
          phone: string;
          email?: string | null;
          district: string;
          upazila: string;
          full_address: string;
          delivery_note?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          guest_phone?: string | null;
          full_name?: string;
          phone?: string;
          email?: string | null;
          district?: string;
          upazila?: string;
          full_address?: string;
          delivery_note?: string | null;
          is_default?: boolean;
          created_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          user_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          address_id: string | null;
          order_status: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
          payment_method: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'shurjopay';
          payment_status: 'pending' | 'verification_needed' | 'paid' | 'failed' | 'refunded';
          subtotal: number;
          discount_amount: number;
          delivery_charge: number;
          total_amount: number;
          coupon_code: string | null;
          admin_note: string | null;
          tracking_id: string | null;
          courier_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          user_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          address_id?: string | null;
          order_status?: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
          payment_method: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'shurjopay';
          payment_status?: 'pending' | 'verification_needed' | 'paid' | 'failed' | 'refunded';
          subtotal: number;
          discount_amount?: number;
          delivery_charge?: number;
          total_amount: number;
          coupon_code?: string | null;
          admin_note?: string | null;
          tracking_id?: string | null;
          courier_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          user_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          address_id?: string | null;
          order_status?: 'pending' | 'confirmed' | 'processing' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
          payment_method?: 'cod' | 'bkash' | 'nagad' | 'rocket' | 'sslcommerz' | 'shurjopay';
          payment_status?: 'pending' | 'verification_needed' | 'paid' | 'failed' | 'refunded';
          subtotal?: number;
          discount_amount?: number;
          delivery_charge?: number;
          total_amount?: number;
          coupon_code?: string | null;
          admin_note?: string | null;
          tracking_id?: string | null;
          courier_name?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      order_items: {
        Row: {
          id: string;
          order_id: string;
          product_id: string | null;
          variant_id: string | null;
          product_name: string;
          size: string | null;
          color: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name: string;
          size?: string | null;
          color?: string | null;
          quantity: number;
          unit_price: number;
          total_price: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          product_id?: string | null;
          variant_id?: string | null;
          product_name?: string;
          size?: string | null;
          color?: string | null;
          quantity?: number;
          unit_price?: number;
          total_price?: number;
          created_at?: string;
        };
      };
      payments: {
        Row: {
          id: string;
          order_id: string;
          method: string;
          amount: number;
          trx_id: string | null;
          proof_image_url: string | null;
          status: 'pending' | 'approved' | 'rejected' | 'failed';
          verified_by: string | null;
          verified_at: string | null;
          rejection_reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          order_id: string;
          method: string;
          amount: number;
          trx_id?: string | null;
          proof_image_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'failed';
          verified_by?: string | null;
          verified_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          order_id?: string;
          method?: string;
          amount?: number;
          trx_id?: string | null;
          proof_image_url?: string | null;
          status?: 'pending' | 'approved' | 'rejected' | 'failed';
          verified_by?: string | null;
          verified_at?: string | null;
          rejection_reason?: string | null;
          created_at?: string;
        };
      };
      coupons: {
        Row: {
          id: string;
          code: string;
          type: 'percent' | 'flat' | 'free_delivery';
          value: number;
          minimum_order: number;
          usage_limit: number | null;
          used_count: number;
          starts_at: string | null;
          expires_at: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          type: 'percent' | 'flat' | 'free_delivery';
          value?: number;
          minimum_order?: number;
          usage_limit?: number | null;
          used_count?: number;
          starts_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          type?: 'percent' | 'flat' | 'free_delivery';
          value?: number;
          minimum_order?: number;
          usage_limit?: number | null;
          used_count?: number;
          starts_at?: string | null;
          expires_at?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
      };
      site_settings: {
        Row: {
          key: string;
          value: Json;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          updated_at?: string;
        };
      };
      banners: {
        Row: {
          id: string;
          title: string | null;
          subtitle: string | null;
          image_url: string | null;
          link_url: string | null;
          position: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          title?: string | null;
          subtitle?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          position?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string | null;
          subtitle?: string | null;
          image_url?: string | null;
          link_url?: string | null;
          position?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
        };
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          user_id: string | null;
          customer_name: string | null;
          rating: number;
          body: string | null;
          image_url: string | null;
          approved: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          user_id?: string | null;
          customer_name?: string | null;
          rating: number;
          body?: string | null;
          image_url?: string | null;
          approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          user_id?: string | null;
          customer_name?: string | null;
          rating?: number;
          body?: string | null;
          image_url?: string | null;
          approved?: boolean;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
      create_order_with_items: {
        Args: {
          p_customer_name: string;
          p_customer_phone: string;
          p_customer_email?: string;
          p_district?: string;
          p_upazila?: string;
          p_full_address?: string;
          p_delivery_note?: string;
          p_payment_method?: string;
          p_trx_id?: string;
          p_subtotal?: number;
          p_discount_amount?: number;
          p_delivery_charge?: number;
          p_total_amount?: number;
          p_coupon_code?: string;
          p_items?: Json;
        };
        Returns: Json;
      };
      approve_manual_payment: {
        Args: {
          p_order_id: string;
        };
        Returns: Json;
      };
      reject_manual_payment: {
        Args: {
          p_order_id: string;
          p_reason?: string;
        };
        Returns: Json;
      };
      track_order: {
        Args: {
          p_order_number: string;
          p_phone: string;
        };
        Returns: Json;
      };
    };
    Enums: Record<string, never>;
  };
}

// ─── Convenience aliases ───────────────────────────────────
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Common row types
export type Profile = Tables<'profiles'>;
export type Category = Tables<'categories'>;
export type DbProduct = Tables<'products'>;
export type ProductImage = Tables<'product_images'>;
export type ProductVariant = Tables<'product_variants'>;
export type Address = Tables<'addresses'>;
export type DbOrder = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type Payment = Tables<'payments'>;
export type Coupon = Tables<'coupons'>;
export type SiteSetting = Tables<'site_settings'>;
export type Banner = Tables<'banners'>;
export type Review = Tables<'reviews'>;

/** Product with joined images and variants — what the frontend usually works with */
export type ProductWithDetails = DbProduct & {
  images: ProductImage[];
  variants: ProductVariant[];
  category?: Category | null;
  reviews?: Review[];
};

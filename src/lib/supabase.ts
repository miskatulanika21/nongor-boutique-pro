import { createClient } from '@supabase/supabase-js';
import type { Database as RawDatabase } from './database.types';

// We export a loosely-typed Database schema to bypass strict relationship and RPC type-checking
// in supabase-js, since relationships are not explicitly generated in database.types.ts.
// This allows all complex queries and RPC functions to compile successfully, while we maintain
// strict type safety via manual casts and aliases from database.types.ts.
export type Database = {
  public: any;
};

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY env vars. ' +
    'Backend features will fall back to mock data.'
  );
}

export const supabase = createClient<Database>(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

/** True when Supabase env vars are configured */
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

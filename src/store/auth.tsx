import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export type CustomerProfile = {
  id: string;
  email: string;
  fullName: string | null;
  phone: string | null;
  role: "admin" | "customer";
};

type AuthState = {
  user: CustomerProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string; profile?: CustomerProfile }>;
  signUp: (input: { email: string; password: string; fullName: string; phone: string }) => Promise<{ ok: boolean; error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ ok: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

async function fetchProfile(userId: string, email: string): Promise<CustomerProfile> {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, phone, role")
      .eq("id", userId)
      .single();
    return {
      id: userId,
      email,
      fullName: data?.full_name ?? null,
      phone: data?.phone ?? null,
      role: (data?.role as "admin" | "customer") ?? "customer",
    };
  } catch {
    return { id: userId, email, fullName: null, phone: null, role: "customer" };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadFromSession = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      const profile = await fetchProfile(data.session.user.id, data.session.user.email ?? "");
      setUser(profile);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;
    loadFromSession();
    if (!isSupabaseConfigured) return;
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      if (event === "SIGNED_OUT" || !session?.user) {
        setUser(null);
        return;
      }
      const profile = await fetchProfile(session.user.id, session.user.email ?? "");
      if (mounted) setUser(profile);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadFromSession]);

  const signIn: AuthState["signIn"] = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) return { ok: false, error: "Authentication is not configured." };
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error || !data.user) return { ok: false, error: error?.message ?? "Sign in failed." };
    const profile = await fetchProfile(data.user.id, data.user.email ?? "");
    setUser(profile);
    return { ok: true, profile };
  }, []);

  const signUp: AuthState["signUp"] = useCallback(async ({ email, password, fullName, phone }) => {
    if (!isSupabaseConfigured) return { ok: false, error: "Authentication is not configured." };
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/account` : undefined;
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: { full_name: fullName, phone },
      },
    });
    if (error) return { ok: false, error: error.message };
    // Try to create/update profile row (in case no trigger exists)
    if (data.user) {
      try {
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          phone,
          role: "customer",
        });
      } catch {
        /* ignore — trigger may handle it */
      }
    }
    const needsConfirmation = !data.session;
    if (data.session && data.user) {
      const profile = await fetchProfile(data.user.id, data.user.email ?? "");
      setUser(profile);
    }
    return { ok: true, needsConfirmation };
  }, []);

  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    if (!isSupabaseConfigured) return { ok: false, error: "Authentication is not configured." };
    const redirectTo = typeof window !== "undefined" ? `${window.location.origin}/reset-password` : undefined;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    if (!isSupabaseConfigured) return { ok: false, error: "Authentication is not configured." };
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadFromSession();
  }, [loadFromSession]);

  return (
    <Ctx.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        signIn,
        signUp,
        signOut,
        requestPasswordReset,
        updatePassword,
        refreshProfile,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

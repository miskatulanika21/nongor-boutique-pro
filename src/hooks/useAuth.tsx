import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { User, Session } from "@supabase/supabase-js";

/* ──────────────────────────── Types ──────────────────────────── */

export type UserRole = "admin" | "customer";

export type UserProfile = {
  id: string;
  fullName: string | null;
  phone: string | null;
  role: UserRole;
  email: string;
};

export type AuthState = {
  /** Supabase user object (null if not authenticated) */
  user: User | null;
  /** Profile from profiles table */
  profile: UserProfile | null;
  /** Shortcut: user's role */
  role: UserRole | null;
  /** True while initial session check is in progress */
  isLoading: boolean;
  /** True when we have a valid session */
  isAuthenticated: boolean;
  /** True when user is admin */
  isAdmin: boolean;

  /* ── Actions ── */
  signIn: (email: string, password: string) => Promise<{ success: boolean; role: UserRole | null; error?: string }>;
  signUp: (email: string, password: string, fullName: string, phone: string) => Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (password: string) => Promise<{ success: boolean; error?: string }>;
};

/* ──────────────────────────── Helpers ──────────────────────────── */

const isBrowser = typeof window !== "undefined";

function saveMockAuth(profile: UserProfile | null) {
  if (!isBrowser) return;
  if (profile) {
    localStorage.setItem("nongor_auth", JSON.stringify(profile));
    // Keep legacy key in sync for admin route guard
    localStorage.setItem("nongor_admin_auth", JSON.stringify({
      isAdmin: profile.role === "admin",
      email: profile.email,
    }));
  } else {
    localStorage.removeItem("nongor_auth");
    localStorage.setItem("nongor_admin_auth", JSON.stringify({ isAdmin: false, email: "" }));
  }
}

function loadMockAuth(): UserProfile | null {
  if (!isBrowser) return null;
  try {
    const v = localStorage.getItem("nongor_auth");
    return v ? JSON.parse(v) : null;
  } catch {
    return null;
  }
}

async function fetchProfile(userId: string, email: string): Promise<UserProfile | null> {
  if (!isSupabaseConfigured) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, phone, role")
    .eq("id", userId)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    fullName: profile.full_name,
    phone: profile.phone,
    role: profile.role as UserRole,
    email,
  };
}

/* ──────────────────────────── Mock users ──────────────────────────── */

const MOCK_USERS: Record<string, { password: string; profile: UserProfile }> = {
  "admin@nongor.com": {
    password: "nongor2024",
    profile: {
      id: "mock-admin-001",
      fullName: "Nongor Admin",
      phone: "+880 1700-000000",
      role: "admin",
      email: "admin@nongor.com",
    },
  },
};

/* ──────────────────────────── Context ──────────────────────────── */

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => loadMockAuth());
  const [isLoading, setIsLoading] = useState(true);

  /* ── On mount: check existing session ── */
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // In mock mode, restore from localStorage
      const saved = loadMockAuth();
      setProfile(saved);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    // Check existing session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;

      if (session?.user) {
        setUser(session.user);
        const p = await fetchProfile(session.user.id, session.user.email ?? "");
        if (mounted) {
          setProfile(p);
          saveMockAuth(p);
        }
      }
      if (mounted) setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          setProfile(null);
          saveMockAuth(null);
          return;
        }

        if (session?.user) {
          setUser(session.user);
          const p = await fetchProfile(session.user.id, session.user.email ?? "");
          if (mounted) {
            setProfile(p);
            saveMockAuth(p);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /* ── Sign In ── */
  const signIn = useCallback(async (
    email: string,
    password: string
  ): Promise<{ success: boolean; role: UserRole | null; error?: string }> => {
    if (!isSupabaseConfigured) {
      // Mock mode
      const mockUser = MOCK_USERS[email.toLowerCase()];
      if (mockUser && mockUser.password === password) {
        setProfile(mockUser.profile);
        saveMockAuth(mockUser.profile);
        return { success: true, role: mockUser.profile.role };
      }

      // Allow any email/password as customer in mock mode (for demo)
      const mockCustomer: UserProfile = {
        id: `mock-customer-${Date.now()}`,
        fullName: email.split("@")[0],
        phone: "",
        role: "customer",
        email,
      };
      setProfile(mockCustomer);
      saveMockAuth(mockCustomer);
      return { success: true, role: "customer" };
    }

    // Real Supabase auth
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      return { success: false, role: null, error: error?.message ?? "Login failed" };
    }

    setUser(data.user);
    const p = await fetchProfile(data.user.id, data.user.email ?? "");
    setProfile(p);
    saveMockAuth(p);

    return { success: true, role: p?.role ?? "customer" };
  }, []);

  /* ── Sign Up ── */
  const signUp = useCallback(async (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ): Promise<{ success: boolean; error?: string; needsConfirmation?: boolean }> => {
    if (!isSupabaseConfigured) {
      // Mock mode: just create a customer profile
      const mockCustomer: UserProfile = {
        id: `mock-customer-${Date.now()}`,
        fullName,
        phone,
        role: "customer",
        email,
      };
      setProfile(mockCustomer);
      saveMockAuth(mockCustomer);
      return { success: true, needsConfirmation: false };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (data.user) {
      setUser(data.user);
      // Profile should be auto-created by the database trigger
      // Wait a moment then fetch
      await new Promise((r) => setTimeout(r, 500));
      const p = await fetchProfile(data.user.id, data.user.email ?? "");
      if (p) {
        // Update profile with name and phone
        await supabase.from("profiles").update({
          full_name: fullName,
          phone,
        }).eq("id", data.user.id);
        p.fullName = fullName;
        p.phone = phone;
      }
      setProfile(p);
      saveMockAuth(p);
    }

    const needsConfirmation = !data.session;
    return { success: true, needsConfirmation };
  }, []);

  /* ── Sign Out ── */
  const signOut = useCallback(async () => {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setProfile(null);
    saveMockAuth(null);
  }, []);

  /* ── Reset Password ── */
  const resetPassword = useCallback(async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: true }; // Mock mode: always succeed
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  }, []);

  /* ── Update Password ── */
  const updatePassword = useCallback(async (password: string): Promise<{ success: boolean; error?: string }> => {
    if (!isSupabaseConfigured) {
      return { success: true }; // Mock mode: always succeed
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  }, []);

  /* ── Derived state ── */
  const role = profile?.role ?? null;
  const isAuthenticated = profile !== null;
  const isAdmin = role === "admin";

  return (
    <AuthCtx.Provider
      value={{
        user,
        profile,
        role,
        isLoading,
        isAuthenticated,
        isAdmin,
        signIn,
        signUp,
        signOut,
        resetPassword,
        updatePassword,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth(): AuthState {
  const v = useContext(AuthCtx);
  if (!v) throw new Error("useAuth must be used within AuthProvider");
  return v;
}

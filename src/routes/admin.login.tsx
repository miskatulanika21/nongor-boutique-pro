import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useAdmin } from "@/store/admin";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Lock, Mail, Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Admin Login — Nongor" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const { login, auth } = useAdmin();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (auth.isAdmin) {
      nav({ to: "/admin/dashboard" });
    }
  }, [auth.isAdmin, nav]);

  if (auth.isAdmin) {
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Email is required"); return; }
    if (!password.trim()) { setError("Password is required"); return; }
    setLoading(true);
    try {
      const ok = await login(email.trim(), password);
      if (ok) {
        toast.success("Welcome back!");
        nav({ to: "/admin/dashboard" });
      } else {
        setError("Invalid email or password");
        toast.error("Invalid credentials");
      }
    } catch {
      setError("Login failed. Please try again.");
      toast.error("Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-charcoal via-maroon-deep to-charcoal flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pattern-nakshi opacity-[0.06]" />
      <div className="relative w-full max-w-md">
        <div className="bg-ivory rounded-3xl shadow-elegant p-8 md:p-10">
          <div className="text-center">
            <Logo />
            <div className="mt-4 text-xs uppercase tracking-[0.3em] text-gold-deep">Admin Panel</div>
            <h1 className="mt-2 font-display text-3xl text-foreground">Sign in</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your admin credentials to continue</p>
          </div>

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Email</label>
              <div className="mt-1.5 relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nongor.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream/50 text-sm outline-none border border-hairline focus:border-maroon focus:bg-ivory transition"
                  autoFocus
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Password</label>
              <div className="mt-1.5 relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-cream/50 text-sm outline-none border border-hairline focus:border-maroon focus:bg-ivory transition"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && <div className="text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-lg">{error}</div>}

            <button type="submit" disabled={loading} className="w-full btn-maroon rounded-xl py-3.5 text-sm font-semibold tracking-wide shadow-elegant disabled:opacity-60">
              {loading ? "Signing in…" : "Sign in to Admin"}
            </button>
          </form>

          {import.meta.env.DEV && (
            <div className="mt-6 text-center text-[11px] text-muted-foreground">
              <div className="p-3 rounded-lg bg-cream/60 border border-gold/20">
                <div className="font-semibold text-foreground/70">Demo credentials (dev only)</div>
                <div className="mt-1 font-mono">admin@nongor.com · nongor2024</div>
              </div>
            </div>
          )}
        </div>
        <div className="mt-4 text-center text-[11px] text-primary-foreground/40">
          <span className="font-bengali">নোঙর</span> · Secure admin authentication
        </div>
      </div>
    </div>
  );
}

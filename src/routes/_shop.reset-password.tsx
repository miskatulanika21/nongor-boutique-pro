import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_shop/reset-password")({
  head: () => ({ meta: [{ title: "Reset password — Nongor" }] }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [recoveryValid, setRecoveryValid] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setReady(true);
      return;
    }
    // Supabase recovery: token is in URL hash, parsed automatically when detectSessionInUrl is true.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        setRecoveryValid(true);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setRecoveryValid(true);
      setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    const res = await updatePassword(password);
    setLoading(false);
    if (!res.success) return setError(res.error ?? "Could not update password.");
    setDone(true);
    toast.success("Password updated");
    setTimeout(() => navigate({ to: "/account" }), 1500);
  };

  return (
    <div className="relative min-h-[80vh] grid place-items-center px-4 py-16 overflow-hidden">
      <div className="absolute inset-0 pattern-nakshi opacity-[0.05] pointer-events-none" aria-hidden />
      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <Logo />
          <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-gold-deep">Secure reset</div>
          <h1 className="mt-2 font-display text-3xl">Choose a new password</h1>
        </div>
        <div className="rounded-3xl bg-ivory/90 backdrop-blur-xl border border-hairline shadow-elegant p-6 md:p-8">
          {!ready ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /></div>
          ) : done ? (
            <div className="text-center space-y-3 py-6">
              <div className="mx-auto h-12 w-12 rounded-full bg-green-50 grid place-items-center">
                <CheckCircle2 className="h-6 w-6 text-green-700" />
              </div>
              <div className="font-display text-xl">All set</div>
              <p className="text-sm text-muted-foreground">Redirecting you to your account…</p>
            </div>
          ) : !recoveryValid ? (
            <div className="text-center space-y-3 py-4">
              <div className="text-sm text-muted-foreground">
                This reset link is invalid or has expired. Please request a new one.
              </div>
              <button onClick={() => navigate({ to: "/login", search: { mode: "forgot" } as never })} className="btn-maroon rounded-xl px-5 py-2.5 text-sm font-semibold">
                Request new link
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <PWField label="New password" value={password} onChange={setPassword} show={show} toggleShow={() => setShow(!show)} />
              <PWField label="Confirm new password" value={confirm} onChange={setConfirm} show={show} toggleShow={() => setShow(!show)} />
              {error && <div className="text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-lg">{error}</div>}
              <button type="submit" disabled={loading} className="w-full btn-maroon rounded-xl py-3.5 text-sm font-semibold shadow-elegant disabled:opacity-60 inline-flex items-center justify-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Update password
              </button>
            </form>
          )}
        </div>
        <div className="mt-6 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-gold-deep" /> Secured by encrypted sessions
        </div>
      </div>
    </div>
  );
}

function PWField({ label, value, onChange, show, toggleShow }: { label: string; value: string; onChange: (v: string) => void; show: boolean; toggleShow: () => void }) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5 relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-cream/50 text-sm outline-none border border-hairline focus:border-maroon focus:bg-ivory transition"
        />
        <button type="button" onClick={toggleShow} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/store/auth";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, Loader2, User2, Phone, ShieldCheck, ArrowLeft, CheckCircle2 } from "lucide-react";

type Mode = "signin" | "signup" | "forgot";

export const Route = createFileRoute("/_shop/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : undefined,
    mode: (search.mode === "signup" || search.mode === "forgot" ? search.mode : "signin") as Mode,
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Nongor" },
      { name: "description", content: "Sign in to your Nongor account to track orders, save favourites, and check out faster." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, signUp, requestPasswordReset, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/_shop/login" });
  const [mode, setMode] = useState<Mode>(search.mode ?? "signin");

  // redirect-back after login
  useEffect(() => {
    if (loading) return;
    if (isAuthenticated) {
      const to = search.redirect ?? (isAdmin ? "/admin/dashboard" : "/account");
      navigate({ to, replace: true } as never);
    }
  }, [isAuthenticated, isAdmin, loading, search.redirect, navigate]);

  return (
    <div className="relative min-h-[80vh] grid place-items-center px-4 py-10 md:py-16 overflow-hidden">
      <div className="absolute inset-0 pattern-nakshi opacity-[0.05] pointer-events-none" aria-hidden />
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-cream/60 to-transparent pointer-events-none" aria-hidden />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center"><Logo /></div>
          <div className="mt-3 text-[10px] uppercase tracking-[0.3em] text-gold-deep">Boutique Account</div>
          <h1 className="mt-2 font-display text-3xl md:text-4xl text-foreground">
            {mode === "signin" && "Welcome back"}
            {mode === "signup" && "Create your account"}
            {mode === "forgot" && "Reset your password"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            {mode === "signin" && "Sign in to track orders, save favourites, and check out faster."}
            {mode === "signup" && "Join Nongor to enjoy member-only drops and personalised care."}
            {mode === "forgot" && "Enter your email and we'll send you a secure reset link."}
          </p>
        </div>

        <div className="relative rounded-3xl bg-ivory/90 backdrop-blur-xl border border-hairline shadow-elegant p-6 md:p-8">
          {mode !== "forgot" && (
            <div className="grid grid-cols-2 p-1 rounded-full bg-cream mb-6 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`py-2.5 rounded-full transition ${mode === "signin" ? "bg-ivory text-maroon shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                Sign in
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`py-2.5 rounded-full transition ${mode === "signup" ? "bg-ivory text-maroon shadow-soft" : "text-muted-foreground hover:text-foreground"}`}
              >
                Create account
              </button>
            </div>
          )}

          {mode === "signin" && <SignInForm onForgot={() => setMode("forgot")} signIn={signIn} />}
          {mode === "signup" && <SignUpForm signUp={signUp} onSignedIn={() => setMode("signin")} />}
          {mode === "forgot" && <ForgotForm onBack={() => setMode("signin")} request={requestPasswordReset} />}

          <p className="mt-6 text-center text-[11px] text-muted-foreground leading-relaxed">
            By continuing, you agree to Nongor's{" "}
            <Link to="/terms" className="text-maroon hover:underline">Terms</Link>,{" "}
            <Link to="/privacy-policy" className="text-maroon hover:underline">Privacy Policy</Link>, and{" "}
            <Link to="/return-policy" className="text-maroon hover:underline">Return Policy</Link>.
          </p>
        </div>

        <div className="mt-6 text-center text-[11px] text-muted-foreground flex items-center justify-center gap-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-gold-deep" />
          Secured by encrypted sessions · <span className="font-bengali text-maroon">নোঙর</span>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon: Icon, type = "text", value, onChange, placeholder, label, autoComplete, required = true,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label: string;
  autoComplete?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5 relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-cream/50 text-sm outline-none border border-hairline focus:border-maroon focus:bg-ivory transition"
        />
      </div>
    </div>
  );
}

function PasswordField({
  value, onChange, label = "Password", autoComplete = "current-password", placeholder = "••••••••",
}: { value: string; onChange: (v: string) => void; label?: string; autoComplete?: string; placeholder?: string; }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <div className="mt-1.5 relative">
        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="w-full pl-10 pr-10 py-3 rounded-xl bg-cream/50 text-sm outline-none border border-hairline focus:border-maroon focus:bg-ivory transition"
        />
        <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" tabIndex={-1} aria-label={show ? "Hide password" : "Show password"}>
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function SubmitBtn({ loading, children }: { loading: boolean; children: React.ReactNode }) {
  return (
    <button type="submit" disabled={loading} className="w-full btn-maroon rounded-xl py-3.5 text-sm font-semibold tracking-wide shadow-elegant disabled:opacity-60 inline-flex items-center justify-center gap-2 transition active:scale-[0.99]">
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

function ErrorBox({ msg }: { msg: string | null }) {
  if (!msg) return null;
  return <div className="text-sm text-destructive bg-destructive/10 px-4 py-2.5 rounded-lg animate-fade-up">{msg}</div>;
}

function SignInForm({ signIn, onForgot }: { signIn: ReturnType<typeof useAuth>["signIn"]; onForgot: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn(email, password);
    setLoading(false);
    if (!res.ok) {
      setError(humanise(res.error));
      return;
    }
    toast.success("Welcome back to Nongor");
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field icon={Mail} type="email" value={email} onChange={setEmail} label="Email" placeholder="you@example.com" autoComplete="email" />
      <PasswordField value={password} onChange={setPassword} autoComplete="current-password" />
      <div className="flex justify-end">
        <button type="button" onClick={onForgot} className="text-xs font-semibold text-maroon hover:text-maroon-deep transition">
          Forgot password?
        </button>
      </div>
      <ErrorBox msg={error} />
      <SubmitBtn loading={loading}>Sign in</SubmitBtn>
    </form>
  );
}

function SignUpForm({ signUp, onSignedIn }: { signUp: ReturnType<typeof useAuth>["signUp"]; onSignedIn: () => void }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => passwordStrength(password), [password]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (!fullName.trim()) return setError("Please tell us your name.");
    if (!validBdPhone(phone)) return setError("Enter a valid Bangladesh phone number (e.g. 01XXXXXXXXX).");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    setLoading(true);
    const res = await signUp({ email, password, fullName: fullName.trim(), phone: normalizeBdPhone(phone) });
    setLoading(false);
    if (!res.ok) return setError(humanise(res.error));
    if (res.needsConfirmation) {
      setSuccess("Check your email to confirm your account, then sign in.");
      toast.success("Account created — confirmation email sent");
      setTimeout(onSignedIn, 1200);
    } else {
      toast.success("Welcome to Nongor");
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field icon={User2} value={fullName} onChange={setFullName} label="Full name" placeholder="Your full name" autoComplete="name" />
      <Field icon={Mail} type="email" value={email} onChange={setEmail} label="Email" placeholder="you@example.com" autoComplete="email" />
      <Field icon={Phone} type="tel" value={phone} onChange={setPhone} label="Phone (Bangladesh)" placeholder="01XXXXXXXXX" autoComplete="tel" />
      <PasswordField value={password} onChange={setPassword} autoComplete="new-password" placeholder="At least 8 characters" />
      {password && (
        <div className="space-y-1.5">
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition ${i < strength.score ? strength.color : "bg-cream"}`} />
            ))}
          </div>
          <div className="text-[11px] text-muted-foreground">{strength.label}</div>
        </div>
      )}
      <ErrorBox msg={error} />
      {success && (
        <div className="text-sm text-green-800 bg-green-50 border border-green-200 px-4 py-2.5 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
          {success}
        </div>
      )}
      <SubmitBtn loading={loading}>Create account</SubmitBtn>
    </form>
  );
}

function ForgotForm({ request, onBack }: { request: ReturnType<typeof useAuth>["requestPasswordReset"]; onBack: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await request(email);
    setLoading(false);
    if (!res.ok) return setError(humanise(res.error));
    setSent(true);
    toast.success("Reset link sent — check your inbox");
  };

  if (sent) {
    return (
      <div className="text-center space-y-4 py-2">
        <div className="mx-auto h-12 w-12 rounded-full bg-green-50 grid place-items-center">
          <CheckCircle2 className="h-6 w-6 text-green-700" />
        </div>
        <div>
          <div className="font-display text-xl">Email on the way</div>
          <p className="mt-1 text-sm text-muted-foreground">
            We've sent a secure reset link to <span className="font-semibold text-foreground">{email}</span>. It expires in 1 hour.
          </p>
        </div>
        <button type="button" onClick={onBack} className="inline-flex items-center gap-2 text-sm font-semibold text-maroon hover:text-maroon-deep">
          <ArrowLeft className="h-4 w-4" /> Back to sign in
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field icon={Mail} type="email" value={email} onChange={setEmail} label="Email" placeholder="you@example.com" autoComplete="email" />
      <ErrorBox msg={error} />
      <SubmitBtn loading={loading}>Send reset link</SubmitBtn>
      <button type="button" onClick={onBack} className="w-full text-center text-xs font-semibold text-muted-foreground hover:text-maroon transition inline-flex items-center justify-center gap-1.5">
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </button>
    </form>
  );
}

/* ───────── helpers ───────── */

function passwordStrength(p: string) {
  let score = 0;
  if (p.length >= 8) score++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) score++;
  if (/\d/.test(p)) score++;
  if (/[^A-Za-z0-9]/.test(p) && p.length >= 10) score++;
  const map = [
    { label: "Too short", color: "bg-destructive" },
    { label: "Weak", color: "bg-orange-400" },
    { label: "Okay", color: "bg-amber-500" },
    { label: "Strong", color: "bg-green-600" },
    { label: "Excellent", color: "bg-green-700" },
  ];
  return { score, label: map[score].label, color: map[score].color };
}

function validBdPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  // accept 01XXXXXXXXX (11 digits) or +8801XXXXXXXXX
  return /^(?:880)?1[3-9]\d{8}$/.test(digits);
}

function normalizeBdPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.startsWith("880")) return `+${d}`;
  if (d.startsWith("0")) return `+88${d}`;
  return `+880${d}`;
}

function humanise(err?: string) {
  if (!err) return "Something went wrong. Please try again.";
  const e = err.toLowerCase();
  if (e.includes("invalid login")) return "Email or password is incorrect.";
  if (e.includes("email not confirmed")) return "Please confirm your email first — check your inbox.";
  if (e.includes("user already registered")) return "An account already exists with this email. Try signing in.";
  if (e.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  return err;
}

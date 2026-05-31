import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState, useCallback } from "react";
import { useShop } from "@/store/shop";
import { taka } from "@/lib/format";
import { districts, upazilas } from "@/data/mock";
import { createOrder } from "@/services/orders";
import { validateCoupon } from "@/services/coupons";
import { isSupabaseConfigured } from "@/lib/supabase";
import {
  step1Schema,
  step2Schema,
  step3Schema,
  normalizePhone,
  type Step1Data,
  type Step2Data,
  type Step3Data,
} from "@/lib/validation";
import {
  Check,
  ShieldCheck,
  Upload,
  ChevronRight,
  Truck,
  CreditCard,
  MapPin,
  User2,
  Tag,
  X,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shop/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Nongor" }] }),
  component: Checkout,
});

const steps = [
  { label: "Information", icon: User2 },
  { label: "Delivery", icon: MapPin },
  { label: "Payment", icon: CreditCard },
  { label: "Review", icon: Check },
];

type CouponResult = {
  code: string;
  type: string;
  value: number;
  discount: number;
  isFreeDelivery: boolean;
};

function Checkout() {
  const { cart, cartTotal, clearCart } = useShop();
  const nav = useNavigate();
  const [step, setStep] = useState(0);

  // ── Form state ──
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [district, setDistrict] = useState("Dhaka");
  const [upazila, setUpazila] = useState("");
  const [address, setAddress] = useState("");
  const [deliveryNote, setDeliveryNote] = useState("");
  const [payment, setPayment] = useState("COD");
  const [trxId, setTrxId] = useState("");

  // ── Validation errors ──
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ── Coupon state ──
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<CouponResult | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  // ── Submit state ──
  const [submitting, setSubmitting] = useState(false);

  // ── Redirect if cart is empty ──
  if (cart.length === 0 && !submitting) {
    nav({ to: "/cart" });
    return null;
  }

  // ── Computed prices ──
  const delivery = useMemo(() => {
    if (appliedCoupon?.isFreeDelivery) return 0;
    return cartTotal > 2500 ? 0 : district === "Dhaka" ? 60 : 120;
  }, [cartTotal, appliedCoupon, district]);

  const discount = appliedCoupon?.discount ?? 0;
  const total = Math.max(0, cartTotal - discount + delivery);

  // ── Validation per step ──
  const validateStep = useCallback(
    (targetStep: number): boolean => {
      setErrors({});
      if (targetStep === 0) {
        const result = step1Schema.safeParse({ name, phone, email });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((i) => {
            const key = i.path[0] as string;
            if (!fieldErrors[key]) fieldErrors[key] = i.message;
          });
          setErrors(fieldErrors);
          return false;
        }
        return true;
      }
      if (targetStep === 1) {
        const result = step2Schema.safeParse({ district, upazila, address, deliveryNote });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((i) => {
            const key = i.path[0] as string;
            if (!fieldErrors[key]) fieldErrors[key] = i.message;
          });
          setErrors(fieldErrors);
          return false;
        }
        return true;
      }
      if (targetStep === 2) {
        const result = step3Schema.safeParse({ payment, trxId: trxId || undefined });
        if (!result.success) {
          const fieldErrors: Record<string, string> = {};
          result.error.issues.forEach((i) => {
            const key = i.path[0] as string;
            if (!fieldErrors[key]) fieldErrors[key] = i.message;
          });
          setErrors(fieldErrors);
          return false;
        }
        return true;
      }
      return true;
    },
    [name, phone, email, district, upazila, address, deliveryNote, payment, trxId]
  );

  const goNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  // ── Coupon ──
  const applyCoupon = async (codeRaw?: string) => {
    const code = (codeRaw ?? couponInput).trim().toUpperCase();
    if (!code) return;
    setCouponError(null);
    setCouponLoading(true);

    try {
      const result = await validateCoupon(code, cartTotal);
      if (!result.valid) {
        setAppliedCoupon(null);
        setCouponError(result.error ?? "Invalid coupon");
        return;
      }

      const coupon = result.coupon;
      setAppliedCoupon({
        code,
        type: coupon?.type === "percent" ? "Percentage" : coupon?.type === "flat" ? "Flat" : "Free Delivery",
        value: coupon?.value ?? 0,
        discount: result.discount ?? 0,
        isFreeDelivery: coupon?.type === "free_delivery",
      });
      setCouponInput(code);
      toast.success(`${code} applied`, {
        description:
          coupon?.type === "percent"
            ? `${coupon.value}% off your subtotal`
            : coupon?.type === "flat"
              ? `${taka(coupon.value)} off`
              : "Free delivery unlocked",
      });
    } catch {
      setCouponError("Failed to validate coupon. Try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  };

  // ── Submit order ──
  const submit = async () => {
    if (submitting) return;

    // Validate all steps
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
      toast.error("Please fix the errors before placing your order.");
      return;
    }

    setSubmitting(true);
    try {
      const normalizedPhone = normalizePhone(phone);

      const result = await createOrder({
        customerName: name.trim(),
        customerPhone: normalizedPhone,
        customerEmail: email.trim() || undefined,
        district,
        upazila,
        fullAddress: address.trim(),
        deliveryNote: deliveryNote.trim() || undefined,
        paymentMethod: payment,
        trxId: trxId.trim() || undefined,
        subtotal: cartTotal,
        discountAmount: discount,
        deliveryCharge: delivery,
        totalAmount: total,
        couponCode: appliedCoupon?.code,
        items: cart.map((it) => ({
          productId: it.productId,
          variantId: it.variantId,
          productName: it.name,
          size: it.size,
          color: it.color,
          quantity: it.qty,
          unitPrice: it.price,
        })),
      });

      if (!result.success) {
        toast.error(result.error ?? "Failed to place order. Please try again.");
        setSubmitting(false);
        return;
      }

      clearCart();
      toast.success("Order placed successfully!");
      nav({
        to: "/order-success",
        search: {
          orderId: result.orderNumber ?? result.orderId,
          phone: normalizedPhone,
        },
      });
    } catch (err) {
      console.error("[checkout] submit error:", err);
      toast.error("An unexpected error occurred. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="container-narrow py-8 md:py-12 pb-32 lg:pb-12">
      <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep">Secure Checkout</div>
      <h1 className="mt-2 font-display text-3xl md:text-5xl tracking-tight">Complete your order</h1>

      {/* Step indicator */}
      <div className="mt-8 bg-card rounded-2xl border border-hairline p-4 md:p-5 shadow-soft">
        <div className="flex items-center gap-2 md:gap-4 overflow-x-auto scrollbar-none">
          {steps.map((s, i) => {
            const done = i < step;
            const active = i === step;
            const Icon = s.icon;
            return (
              <div key={s.label} className="flex items-center gap-2 md:gap-3 shrink-0">
                <div
                  className={`relative h-10 w-10 md:h-11 md:w-11 rounded-full grid place-items-center transition-all ease-soft ${
                    active
                      ? "bg-maroon text-primary-foreground shadow-elegant scale-105"
                      : done
                        ? "bg-gold/20 text-maroon ring-1 ring-gold/40"
                        : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="hidden sm:block">
                  <div className={`text-[10px] uppercase tracking-[0.18em] ${active ? "text-maroon" : "text-muted-foreground"}`}>Step {i + 1}</div>
                  <div className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-foreground/70" : "text-muted-foreground"}`}>{s.label}</div>
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-6 md:w-12 h-px ${done ? "bg-gold" : "bg-hairline"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_400px] gap-6 lg:gap-8">
        <div className="bg-card rounded-2xl p-5 md:p-8 shadow-soft border border-hairline animate-fade-up" key={step}>
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-tight">Customer Information</h2>
              <p className="text-sm text-muted-foreground -mt-2">We'll use this to confirm your order.</p>
              <Field label="Full name" placeholder="Tasnim Rahman" value={name} onChange={setName} error={errors.name} required />
              <Field label="Phone number" placeholder="01XXXXXXXXX" value={phone} onChange={setPhone} error={errors.phone} required />
              <Field label="Email (optional)" placeholder="you@email.com" value={email} onChange={setEmail} error={errors.email} />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-tight">Delivery Address</h2>
              <p className="text-sm text-muted-foreground -mt-2">Where should we deliver your kurti?</p>
              <div className="grid md:grid-cols-2 gap-4">
                <Select label="District" value={district} onChange={(v) => { setDistrict(v); setUpazila(""); }} options={districts} error={errors.district} />
                <Select label="Upazila / Area" value={upazila} onChange={setUpazila} options={upazilas[district] ?? ["Central"]} error={errors.upazila} />
              </div>
              <Field label="Full address" placeholder="House / Road / Area" value={address} onChange={setAddress} error={errors.address} required />
              <Field label="Delivery note (optional)" placeholder="Any specific instructions" value={deliveryNote} onChange={setDeliveryNote} error={errors.deliveryNote} />
              <div className="mt-2 flex items-start gap-3 p-3.5 rounded-xl bg-cream/60 border border-gold/30">
                <Truck className="h-5 w-5 text-gold-deep shrink-0 mt-0.5" />
                <div className="text-xs text-foreground/80">
                  Inside Dhaka: 1–2 days · ৳60 · Outside Dhaka: 3–5 days · ৳120. Free delivery on orders over ৳2,500.
                </div>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-tight">Payment Method</h2>
              <p className="text-sm text-muted-foreground -mt-2">Choose how you'd like to pay.</p>
              {errors.payment && (
                <p className="text-[11px] text-rose-700 flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> {errors.payment}</p>
              )}
              <div className="space-y-2.5">
                {[
                  { id: "COD", label: "Cash on Delivery", note: "Pay when you receive" },
                  { id: "bKash", label: "bKash", note: "Manual transfer" },
                  { id: "Nagad", label: "Nagad", note: "Manual transfer" },
                  { id: "Rocket", label: "Rocket", note: "Manual transfer" },
                ].map((m) => (
                  <label
                    key={m.id}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ease-soft ${
                      payment === m.id ? "border-maroon bg-cream/60 shadow-soft" : "border-hairline hover:border-gold/50 hover:bg-cream/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={payment === m.id} onChange={() => setPayment(m.id)} className="accent-maroon h-4 w-4" />
                      <div>
                        <div className="font-medium text-sm">{m.label}</div>
                        <div className="text-[11px] text-muted-foreground">{m.note}</div>
                      </div>
                    </div>
                    {m.id === "COD" && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 ring-1 ring-emerald-200 px-2.5 py-1 rounded-full">
                        Most popular
                      </span>
                    )}
                  </label>
                ))}
              </div>
              {["bKash", "Nagad", "Rocket"].includes(payment) && (
                <div className="mt-4 bg-cream/60 rounded-xl p-4 border border-gold/30 animate-fade-up">
                  <div className="text-sm">
                    Send <span className="font-display text-maroon text-lg font-semibold">{taka(total)}</span> to merchant{" "}
                    <span className="font-semibold text-charcoal">01700-000000</span> via {payment}.
                  </div>
                  <div className="mt-3">
                    <Field label="Transaction ID" placeholder="e.g. 9BHX22YT01" value={trxId} onChange={setTrxId} error={errors.trxId} required />
                  </div>
                  <p className="mt-3 text-[11px] text-muted-foreground">Your payment will be verified by admin before confirmation.</p>
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl tracking-tight">Review your order</h2>
              <div className="space-y-1 text-sm bg-cream/40 rounded-xl p-4 border border-gold/15">
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-medium">{name}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{phone}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Address</span><span className="font-medium text-right max-w-[60%]">{address}, {upazila || district}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="font-medium">{payment}{trxId ? ` · ${trxId}` : ""}</span></div>
              </div>
              {cart.map((it, i) => (
                <div key={i} className="flex gap-3 py-3 border-b border-hairline/60 last:border-0">
                  <img src={it.image} className="h-16 w-14 object-cover rounded-lg" alt="" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.size} · {it.color} × {it.qty}</div>
                  </div>
                  <div className="font-medium font-display text-maroon">{taka(it.price * it.qty)}</div>
                </div>
              ))}
              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-4 p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <ShieldCheck className="h-4 w-4 text-emerald-700" /> Secure checkout — your data is encrypted
              </div>
            </div>
          )}

          {/* Desktop nav buttons */}
          <div className="mt-8 hidden lg:flex justify-between gap-3">
            <button
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 rounded-full border border-hairline text-sm font-medium disabled:opacity-40 hover:bg-cream transition"
            >
              Back
            </button>
            {step < 3 ? (
              <button onClick={goNext} className="btn-maroon px-8 py-3 rounded-full text-sm font-semibold inline-flex items-center gap-2">
                Continue <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting}
                className="btn-maroon px-8 py-3 rounded-full text-sm font-semibold shadow-elegant inline-flex items-center gap-2 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {submitting ? "Placing order…" : `Place Order — ${taka(total)}`}
              </button>
            )}
          </div>
        </div>

        {/* Summary */}
        <div className="bg-card rounded-2xl p-6 shadow-soft border border-hairline h-fit lg:sticky lg:top-28">
          <h3 className="font-display text-xl tracking-tight">Order Summary</h3>
          <div className="mt-4 space-y-3 text-sm max-h-72 overflow-y-auto pr-1">
            {cart.map((it, i) => (
              <div key={i} className="flex gap-3">
                <div className="relative">
                  <img src={it.image} className="h-14 w-12 object-cover rounded-lg" alt="" />
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 px-1 rounded-full bg-maroon text-primary-foreground text-[10px] font-semibold grid place-items-center">{it.qty}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium line-clamp-1">{it.name}</div>
                  <div className="text-[11px] text-muted-foreground">{it.size} · {it.color}</div>
                </div>
                <div className="text-xs font-medium font-display text-maroon">{taka(it.price * it.qty)}</div>
              </div>
            ))}
          </div>

          {/* Coupon */}
          <div className="mt-5 pt-5 border-t border-hairline">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Tag className="h-3.5 w-3.5 text-gold" /> Promo code
            </div>
            {appliedCoupon ? (
              <div className="mt-2 flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 animate-fade-up">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-emerald-700" strokeWidth={3} />
                  <div>
                    <div className="font-semibold text-emerald-800">{appliedCoupon.code}</div>
                    <div className="text-[11px] text-emerald-700/80">
                      {appliedCoupon.type === "Percentage" && `${appliedCoupon.value}% off subtotal`}
                      {appliedCoupon.type === "Flat" && `${taka(appliedCoupon.value)} off`}
                      {appliedCoupon.type === "Free Delivery" && "Free delivery"}
                    </div>
                  </div>
                </div>
                <button onClick={removeCoupon} className="p-1.5 rounded-full hover:bg-emerald-100 text-emerald-800" aria-label="Remove coupon">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={couponInput}
                    onChange={(e) => {
                      setCouponInput(e.target.value.toUpperCase());
                      if (couponError) setCouponError(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                    placeholder="Enter code"
                    className={`flex-1 px-3 py-2.5 rounded-lg bg-cream/50 text-sm outline-none border tracking-wider uppercase placeholder:normal-case placeholder:tracking-normal placeholder:text-muted-foreground/70 transition ${
                      couponError ? "border-rose-400 bg-rose-50/50" : "border-hairline focus:border-maroon focus:bg-ivory"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => applyCoupon()}
                    disabled={!couponInput.trim() || couponLoading}
                    className="px-4 py-2.5 rounded-lg bg-maroon text-primary-foreground text-xs font-semibold disabled:opacity-50 inline-flex items-center gap-1.5 hover:bg-maroon/90 transition"
                  >
                    {couponLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Apply"}
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-[11px] text-rose-700 flex items-center gap-1.5 animate-fade-up">
                    <X className="h-3.5 w-3.5" /> {couponError}
                  </p>
                )}
              </>
            )}
          </div>

          <div className="mt-5 pt-5 border-t border-hairline space-y-1.5 text-sm">
            <Row label="Subtotal" value={taka(cartTotal)} />
            {discount > 0 && (
              <Row label={`Discount (${appliedCoupon?.code})`} value={`− ${taka(discount)}`} good />
            )}
            <Row label="Delivery" value={delivery === 0 ? "Free" : taka(delivery)} good={delivery === 0} />
          </div>
          <div className="mt-3 pt-3 border-t border-hairline flex items-baseline justify-between">
            <span className="font-display text-lg">Total</span>
            <span className="font-display text-2xl text-maroon font-semibold transition-all">{taka(total)}</span>
          </div>
          {discount > 0 && (
            <div className="mt-2 text-[11px] text-emerald-700 font-medium text-right animate-fade-up">
              You saved {taka(discount)} ✦
            </div>
          )}

          <div className="mt-4 flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" /> SSL Secure · Verified merchant
          </div>
        </div>
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-20 inset-x-0 z-30 px-3 pb-safe">
        <div className="mx-auto rounded-2xl bg-ivory/95 backdrop-blur-xl border border-hairline shadow-elegant p-3 flex items-center gap-3">
          <button
            disabled={step === 0}
            onClick={() => setStep(step - 1)}
            className="h-12 px-4 rounded-full border border-hairline text-xs font-medium disabled:opacity-40"
          >
            Back
          </button>
          <div className="flex-1 text-right">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Total</div>
            <div className="font-display text-base text-maroon font-semibold leading-tight">{taka(total)}</div>
          </div>
          {step < 3 ? (
            <button onClick={goNext} className="btn-maroon h-12 px-5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5">
              Continue <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={submit}
              disabled={submitting}
              className="btn-maroon h-12 px-5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Placing…" : "Place Order"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1.5 w-full px-4 py-3 rounded-lg bg-cream/50 text-sm outline-none border transition ${
          error ? "border-rose-400 bg-rose-50/50" : "border-hairline focus:border-maroon focus:bg-ivory"
        }`}
      />
      {error && (
        <p className="mt-1 text-[11px] text-rose-700 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function Select({ label, value, onChange, options, error }: { label: string; value?: string; onChange?: (v: string) => void; options: string[]; error?: string }) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={`mt-1.5 w-full px-4 py-3 rounded-lg bg-cream/50 text-sm outline-none border transition ${
          error ? "border-rose-400 bg-rose-50/50" : "border-hairline focus:border-maroon focus:bg-ivory"
        }`}
      >
        <option value="">Select…</option>
        {options.map((d) => <option key={d}>{d}</option>)}
      </select>
      {error && (
        <p className="mt-1 text-[11px] text-rose-700 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );
}

function Row({ label, value, good }: { label: string; value: string; good?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={good ? "text-emerald-700 font-medium" : ""}>{value}</span>
    </div>
  );
}

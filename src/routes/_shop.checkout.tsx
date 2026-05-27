import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useShop } from "@/store/shop";
import { taka } from "@/lib/format";
import { districts, upazilas } from "@/data/mock";
import { Check, ShieldCheck, Upload } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_shop/checkout")({
  head: () => ({ meta: [{ title: "Checkout — Nongor" }] }),
  component: Checkout,
});

const steps = ["Information", "Delivery", "Payment", "Review"];

function Checkout() {
  const { cart, cartTotal, clearCart } = useShop();
  const nav = useNavigate();
  const [step, setStep] = useState(0);
  const [district, setDistrict] = useState("Dhaka");
  const [payment, setPayment] = useState("COD");
  const delivery = cartTotal > 2500 ? 0 : 80;
  const total = cartTotal + delivery;

  const submit = () => {
    toast.success("Order placed!");
    clearCart();
    nav({ to: "/order-success" });
  };

  return (
    <div className="container-narrow py-10">
      <h1 className="font-display text-3xl md:text-5xl">Checkout</h1>

      <div className="mt-8 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 shrink-0">
            <div className={`h-8 w-8 rounded-full grid place-items-center text-xs font-semibold ${i <= step ? "bg-maroon text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className={`text-sm font-medium ${i === step ? "text-maroon" : "text-muted-foreground"}`}>{s}</span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="bg-card rounded-2xl p-6 md:p-8 shadow-soft">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Customer Information</h2>
              <Field label="Full name" placeholder="Tasnim Rahman" />
              <Field label="Phone number" placeholder="01XXXXXXXXX" />
              <Field label="Email (optional)" placeholder="you@email.com" />
            </div>
          )}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Delivery Address</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">District</label>
                  <select value={district} onChange={(e) => setDistrict(e.target.value)} className="mt-1 w-full px-4 py-2.5 rounded-lg bg-secondary text-sm">
                    {districts.map((d) => <option key={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Upazila / Area</label>
                  <select className="mt-1 w-full px-4 py-2.5 rounded-lg bg-secondary text-sm">
                    {(upazilas[district] ?? ["Central"]).map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <Field label="Full address" placeholder="House / Road / Area" />
              <Field label="Delivery note (optional)" placeholder="Any specific instructions" />
            </div>
          )}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Payment Method</h2>
              <div className="space-y-2">
                {["COD", "bKash", "Nagad", "Rocket", "Card", "ShurjoPay"].map((m) => (
                  <label key={m} className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition ${payment === m ? "border-maroon bg-cream" : "border-border"}`}>
                    <div className="flex items-center gap-3">
                      <input type="radio" checked={payment === m} onChange={() => setPayment(m)} className="accent-maroon" />
                      <span className="font-medium">{m === "COD" ? "Cash on Delivery" : m === "Card" ? "Card / SSLCommerz" : `${m} Manual Payment`}</span>
                    </div>
                    {m === "COD" && <span className="text-xs text-green-700">Pay on delivery</span>}
                  </label>
                ))}
              </div>
              {["bKash", "Nagad", "Rocket"].includes(payment) && (
                <div className="mt-4 bg-cream rounded-xl p-4 border border-gold/30">
                  <div className="text-sm">Send <span className="font-display text-maroon text-lg">{taka(total)}</span> to merchant <span className="font-semibold">01700-000000</span> via {payment}.</div>
                  <div className="mt-3 grid sm:grid-cols-2 gap-3">
                    <Field label="Transaction ID" placeholder="e.g. 9BHX22YT01" />
                    <div>
                      <label className="text-sm font-medium">Screenshot</label>
                      <button type="button" className="mt-1 w-full px-4 py-2.5 rounded-lg border border-dashed border-maroon/40 text-sm text-maroon flex items-center justify-center gap-2"><Upload className="h-4 w-4" /> Upload</button>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">Your payment will be verified by admin before confirmation.</p>
                </div>
              )}
            </div>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-display text-2xl">Review Order</h2>
              {cart.map((it, i) => (
                <div key={i} className="flex gap-3 py-2 border-b border-border/40">
                  <img src={it.image} className="h-16 w-14 object-cover rounded-lg" alt="" />
                  <div className="flex-1 text-sm">
                    <div className="font-medium">{it.name}</div>
                    <div className="text-xs text-muted-foreground">{it.size} · {it.color} × {it.qty}</div>
                  </div>
                  <div className="font-medium">{taka(it.price * it.qty)}</div>
                </div>
              ))}
              <div className="text-sm text-muted-foreground flex items-center gap-2 mt-4"><ShieldCheck className="h-4 w-4 text-green-700" /> Secure checkout — your data is encrypted</div>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <button disabled={step === 0} onClick={() => setStep(step - 1)} className="px-6 py-3 rounded-full border border-border text-sm font-medium disabled:opacity-40">Back</button>
            {step < 3 ? (
              <button onClick={() => setStep(step + 1)} className="px-8 py-3 rounded-full bg-maroon text-primary-foreground text-sm font-semibold">Continue</button>
            ) : (
              <button onClick={submit} className="px-8 py-3 rounded-full bg-maroon text-primary-foreground text-sm font-semibold shadow-elegant">Place Order</button>
            )}
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 shadow-soft h-fit lg:sticky lg:top-24">
          <h3 className="font-display text-xl">Summary</h3>
          <div className="mt-4 space-y-3 text-sm">
            {cart.map((it, i) => (
              <div key={i} className="flex gap-3">
                <img src={it.image} className="h-14 w-12 object-cover rounded" alt="" />
                <div className="flex-1">
                  <div className="text-xs font-medium line-clamp-1">{it.name}</div>
                  <div className="text-[11px] text-muted-foreground">{it.size} · {it.color} × {it.qty}</div>
                </div>
                <div className="text-xs font-medium">{taka(it.price * it.qty)}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{taka(cartTotal)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Delivery</span><span>{delivery === 0 ? "Free" : taka(delivery)}</span></div>
          </div>
          <div className="mt-3 pt-3 border-t border-border flex items-baseline justify-between">
            <span className="font-display">Total</span>
            <span className="font-display text-2xl text-maroon">{taka(total)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input placeholder={placeholder} className="mt-1 w-full px-4 py-2.5 rounded-lg bg-secondary text-sm outline-none border border-transparent focus:border-maroon" />
    </div>
  );
}

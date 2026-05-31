import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/_shop/privacy-policy")({
  head: () => ({
    meta: [
      { title: "Privacy Policy — Nongor" },
      { name: "description", content: "How Nongor collects, uses, and protects your information." },
    ],
  }),
  component: PrivacyPolicy,
});

function PrivacyPolicy() {
  return (
    <div className="bg-cream/30">
      <PolicyHeader title="Privacy Policy" tagline="Your trust is the thread that holds us together." />
      <article className="container-narrow py-12 md:py-16">
        <div className="mx-auto max-w-3xl bg-ivory rounded-3xl shadow-soft border border-hairline p-7 md:p-12 prose-policy">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Last updated: 31 May 2026</p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            At Nongor (নোঙর), we treat your personal information with the same care we put into every hand-stitched
            kurti. This policy explains what we collect, why we collect it, and the choices you have.
          </p>

          <Section title="1. Information we collect">
            <ul>
              <li><b>Account details:</b> your name, email, and phone number.</li>
              <li><b>Order &amp; delivery details:</b> shipping address, district, postal code, and order history.</li>
              <li><b>Payment information:</b> payment method, transaction ID, and last four digits of cards (we never store full card numbers).</li>
              <li><b>Technical data:</b> device type, browser, IP address, and basic analytics to improve the site.</li>
              <li><b>Communication:</b> messages you send through chat, email, or our contact form.</li>
            </ul>
          </Section>

          <Section title="2. How we use your information">
            <ul>
              <li>To process and deliver your orders through trusted courier partners.</li>
              <li>To verify payments made through bKash, Nagad, Rocket, cards, or COD confirmation.</li>
              <li>To send order updates, delivery notifications, and important account messages.</li>
              <li>To keep your account secure and prevent fraud.</li>
              <li>To improve our products, website experience, and customer service.</li>
            </ul>
          </Section>

          <Section title="3. Cookies &amp; analytics">
            <p>
              We use a small number of essential cookies to keep you signed in and to remember your cart. Basic,
              anonymised analytics help us understand which products our customers love most. You may clear cookies
              from your browser at any time.
            </p>
          </Section>

          <Section title="4. Sharing your information">
            <p>We never sell your data. We share only what is needed, only with:</p>
            <ul>
              <li>Courier partners (Pathao, Steadfast, RedX, Sundarban, etc.) for delivery.</li>
              <li>Payment processors for transaction verification.</li>
              <li>Trusted infrastructure providers that host our website.</li>
              <li>Authorities, only when legally required.</li>
            </ul>
          </Section>

          <Section title="5. Data security">
            <p>
              Your password is hashed and never stored in plain text. Sessions are encrypted. We restrict internal
              access to the minimum number of team members required to serve you.
            </p>
          </Section>

          <Section title="6. Your rights">
            <ul>
              <li>Request a copy of the personal data we hold about you.</li>
              <li>Ask us to correct or delete your data.</li>
              <li>Opt out of marketing messages at any time.</li>
              <li>Close your account by contacting our support team.</li>
            </ul>
          </Section>

          <Section title="7. Children">
            <p>Nongor's services are intended for customers aged 18 and above.</p>
          </Section>

          <Section title="8. Contact us">
            <p>
              Questions about your privacy? Email us at{" "}
              <a className="text-maroon underline" href="mailto:hello@nongor.com.bd">hello@nongor.com.bd</a> or visit our{" "}
              <Link to="/about" className="text-maroon underline">contact page</Link>.
            </p>
          </Section>
        </div>
      </article>
    </div>
  );
}

export function PolicyHeader({ title, tagline }: { title: string; tagline: string }) {
  return (
    <header className="relative overflow-hidden bg-gradient-to-b from-cream to-ivory border-b border-hairline">
      <div className="absolute inset-0 pattern-nakshi opacity-[0.06] pointer-events-none" aria-hidden />
      <div className="container-narrow py-10 md:py-14 relative">
        <nav className="flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          <Link to="/" className="hover:text-maroon">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-foreground/70">{title}</span>
        </nav>
        <div className="mt-4 flex items-start gap-3">
          <div className="h-10 w-10 rounded-full bg-maroon/10 grid place-items-center"><ShieldCheck className="h-5 w-5 text-maroon" /></div>
          <div>
            <h1 className="font-display text-4xl md:text-5xl text-foreground">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground max-w-xl">{tagline}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-maroon">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-foreground/80 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_b]:text-foreground">{children}</div>
    </section>
  );
}

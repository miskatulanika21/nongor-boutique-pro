import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyHeader } from "./_shop.privacy-policy";

export const Route = createFileRoute("/_shop/terms")({
  head: () => ({ meta: [{ title: "Terms & Conditions — Nongor" }] }),
  component: Terms,
});

function Terms() {
  return (
    <div className="bg-cream/30">
      <PolicyHeader
        title="Terms & Conditions"
        tagline="The simple rules that keep our boutique fair and trustworthy."
      />
      <article className="container-narrow py-12 md:py-16">
        <div className="mx-auto max-w-3xl bg-ivory rounded-3xl shadow-soft border border-hairline p-7 md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">
            Last updated: 31 May 2026
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            By using nongor.com.bd you agree to the terms below.
          </p>

          <S title="1. Orders &amp; pricing">
            <p>
              Prices are in Bangladeshi Taka (৳). We reserve the right to cancel orders priced or
              listed in error and to refund any payment made.
            </p>
          </S>
          <S title="2. Payments">
            <p>
              We accept bKash, Nagad, Rocket, ShurjoPay, card payments, and Cash on Delivery.
              Payment must be verified before dispatch.
            </p>
          </S>
          <S title="3. Delivery">
            <p>
              Inside Dhaka: 1–3 business days. Outside Dhaka: 3–7 business days. Delivery times may
              vary during holidays and festivals.
            </p>
          </S>
          <S title="4. Returns &amp; exchanges">
            <p>
              Covered by our{" "}
              <Link to="/return-policy" className="text-maroon underline">
                Return Policy
              </Link>
              .
            </p>
          </S>
          <S title="5. Intellectual property">
            <p>
              All photography, designs, the name "Nongor / নোঙর", and the logo are property of
              Nongor and may not be used without written permission.
            </p>
          </S>
          <S title="6. Account responsibility">
            <p>
              You're responsible for keeping your password safe. Please notify us at once if you
              suspect unauthorised access.
            </p>
          </S>
          <S title="7. Limitation of liability">
            <p>
              To the maximum extent permitted by law, Nongor is not liable for indirect or
              consequential losses arising from the use of our website or products.
            </p>
          </S>
          <S title="8. Governing law">
            <p>
              These terms are governed by the laws of Bangladesh. Disputes will be resolved in the
              courts of Dhaka.
            </p>
          </S>
          <S title="9. Contact">
            <p>
              Questions? Email{" "}
              <a className="text-maroon underline" href="mailto:hello@nongor.com.bd">
                hello@nongor.com.bd
              </a>
              .
            </p>
          </S>
        </div>
      </article>
    </div>
  );
}

function S({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="font-display text-xl text-maroon">{title}</h2>
      <div className="mt-2 text-sm leading-relaxed text-foreground/80 space-y-2 [&_b]:text-foreground">
        {children}
      </div>
    </section>
  );
}

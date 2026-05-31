import { createFileRoute, Link } from "@tanstack/react-router";
import { PolicyHeader } from "./_shop.privacy-policy";

export const Route = createFileRoute("/_shop/return-policy")({
  head: () => ({
    meta: [
      { title: "Return & Exchange Policy — Nongor" },
      { name: "description", content: "Nongor's return, exchange, and refund policy for handmade kurti." },
    ],
  }),
  component: ReturnPolicy,
});

function ReturnPolicy() {
  return (
    <div className="bg-cream/30">
      <PolicyHeader title="Return & Exchange Policy" tagline="Hand-stitched with care — and backed by an honest exchange promise." />
      <article className="container-narrow py-12 md:py-16">
        <div className="mx-auto max-w-3xl bg-ivory rounded-3xl shadow-soft border border-hairline p-7 md:p-12">
          <p className="text-xs uppercase tracking-[0.3em] text-gold-deep">Last updated: 31 May 2026</p>
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Every Nongor kurti is hand-cut and hand-stitched by artisans in Bangladesh. Small variations in colour,
            stitch density, and embroidery placement are part of the craft — never defects. With that in mind, here
            is our exchange promise.
          </p>

          <S title="1. Exchange window">
            <p>You may request a size exchange within <b>3 days of delivery</b>, subject to stock availability.</p>
          </S>

          <S title="2. Eligibility">
            <ul>
              <li>The product must be unworn, unwashed, and undamaged.</li>
              <li>All original tags, packaging, and the invoice must be intact.</li>
              <li>Products marked as "Custom Order" or "Final Sale" are not eligible for exchange.</li>
            </ul>
          </S>

          <S title="3. Damaged or wrong product">
            <p>
              If you receive a damaged item or the wrong product, please share a photo within <b>24 hours of delivery</b>
              via WhatsApp at <a className="text-maroon underline" href="tel:+8801700000000">+880 1700-000000</a>. We will
              arrange a free replacement or full refund.
            </p>
          </S>

          <S title="4. Size issues">
            <p>
              We provide a detailed <Link to="/size-guide" className="text-maroon underline">size guide</Link>. If the size
              doesn't fit, we offer a one-time complimentary exchange within Dhaka. Outside Dhaka, return courier charges
              are borne by the customer.
            </p>
          </S>

          <S title="5. Handmade product note">
            <p>
              Slight irregularities in hand-block prints, hand embroidery, and natural dyes are signatures of craft —
              not defects. These do not qualify for exchange or refund.
            </p>
          </S>

          <S title="6. Refunds &amp; payment adjustments">
            <ul>
              <li>Online payments: refunded to the original payment method within 5–7 business days.</li>
              <li>Cash on Delivery: refunded via bKash, Nagad, or store credit at your preference.</li>
              <li>Delivery charges paid on the original order are non-refundable.</li>
            </ul>
          </S>

          <S title="7. How to request an exchange or return">
            <ol className="list-decimal pl-5 space-y-1.5">
              <li>WhatsApp or email us with your order ID, the reason, and photos if relevant.</li>
              <li>Our team confirms eligibility within 24 hours.</li>
              <li>We arrange courier pickup or share a return address.</li>
              <li>Once we receive and inspect the item, we process the exchange or refund.</li>
            </ol>
          </S>

          <S title="8. Contact us">
            <p>
              For any return or exchange questions, reach us at{" "}
              <a className="text-maroon underline" href="mailto:hello@nongor.com.bd">hello@nongor.com.bd</a> or{" "}
              <a className="text-maroon underline" href="tel:+8801700000000">+880 1700-000000</a> (10am–8pm).
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
      <div className="mt-2 text-sm leading-relaxed text-foreground/80 space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_b]:text-foreground">{children}</div>
    </section>
  );
}

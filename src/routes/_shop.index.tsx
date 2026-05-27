import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sparkles, Heart, Truck, ShieldCheck, Scissors } from "lucide-react";
import { products, categories, testimonials } from "@/data/mock";
import { ProductCard } from "@/components/ProductCard";
import logo from "@/assets/nongor-logo.png";

export const Route = createFileRoute("/_shop/")({
  head: () => ({
    meta: [
      { title: "Nongor — Handmade Bangladeshi Kurti" },
      { name: "description", content: "Premium handmade kurti, hand-stitched by Bangladeshi artisans. Maroon, antique gold, cultural elegance." },
    ],
  }),
  component: Home,
});

function Home() {
  const newArrivals = products.filter((p) => p.isNew).slice(0, 4);
  const bestSellers = products.filter((p) => p.isBestSeller).slice(0, 4);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pattern-nakshi opacity-30" />
        <div className="container-narrow relative grid lg:grid-cols-2 gap-10 py-12 md:py-20 lg:py-28 items-center">
          <div>
            <div className="inline-flex items-center gap-2 bg-cream border border-gold/30 rounded-full px-4 py-1.5 text-xs text-maroon font-medium">
              <Sparkles className="h-3.5 w-3.5 text-gold" /> New Festive Collection · 2025
            </div>
            <h1 className="mt-6 font-display text-4xl md:text-6xl lg:text-7xl leading-[1.05] text-foreground">
              Handmade<br />
              <span className="text-maroon italic">Elegance</span> rooted in<br />
              Bangladeshi culture
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
              <span className="font-bengali text-maroon">নোঙর</span> — a boutique of hand-stitched kurti, each piece sewn by women artisans, carrying the soul of Nakshi Kantha craft into modern wear.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/shop" className="group inline-flex items-center gap-2 bg-maroon hover:bg-maroon-deep text-primary-foreground px-7 py-3.5 rounded-full text-sm font-semibold tracking-wide transition shadow-elegant">
                Shop Collection <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
              <a href="#story" className="inline-flex items-center gap-2 border border-maroon/20 hover:border-maroon px-7 py-3.5 rounded-full text-sm font-semibold text-maroon transition">
                Explore Nongor
              </a>
            </div>
            <div className="mt-10 flex items-center gap-6 text-xs text-muted-foreground">
              <div><span className="font-display text-2xl text-maroon">100%</span><div>Handmade</div></div>
              <div className="h-8 w-px bg-border" />
              <div><span className="font-display text-2xl text-maroon">64+</span><div>Artisans</div></div>
              <div className="h-8 w-px bg-border" />
              <div><span className="font-display text-2xl text-maroon">★ 4.9</span><div>Customer love</div></div>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-to-br from-gold/20 via-maroon/10 to-transparent rounded-[3rem] blur-2xl" />
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-elegant bg-cream">
              <img src="https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=900&q=80" alt="Handmade kurti" className="w-full h-full object-cover" />
              <div className="absolute bottom-6 left-6 right-6 bg-ivory/90 backdrop-blur-md rounded-2xl p-4 flex items-center gap-3 shadow-soft">
                <img src={logo} alt="" className="h-10 w-10" />
                <div>
                  <div className="text-xs text-muted-foreground">Featured piece</div>
                  <div className="font-display text-base">Maroon Nakshi Kurti — ৳2,690</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container-narrow py-14">
        <SectionHeading eyebrow="Curated for you" title="Featured Collections" />
        <div className="mt-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((c) => (
            <Link key={c.id} to="/shop" className="group block">
              <div className="aspect-square rounded-2xl overflow-hidden bg-cream relative shadow-soft">
                <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-maroon/70 via-maroon/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4 text-primary-foreground">
                  <div className="font-display text-base md:text-lg">{c.name}</div>
                  <div className="text-[11px] opacity-80">{c.count > 0 ? `${c.count} pieces` : c.status}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* NEW ARRIVALS */}
      <section className="container-narrow py-10">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Just landed" title="New Arrivals" />
          <Link to="/shop" className="hidden md:inline-flex items-center gap-1 text-sm text-maroon font-medium hover:gap-2 transition-all">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {newArrivals.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* STORY */}
      <section id="story" className="mt-20 bg-gradient-to-br from-maroon to-maroon-deep text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 pattern-nakshi opacity-10" />
        <div className="container-narrow relative grid lg:grid-cols-2 gap-12 py-16 md:py-24 items-center">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-elegant">
            <img src="https://images.unsplash.com/photo-1606902965551-dce093cda6e7?auto=format&fit=crop&w=900&q=80" alt="Artisan at work" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="inline-block text-gold text-xs uppercase tracking-[0.3em]">Our Craft</div>
            <h2 className="mt-4 font-display text-4xl md:text-5xl leading-tight">Every stitch carries a story</h2>
            <p className="mt-5 text-primary-foreground/85 leading-relaxed">
              Inspired by the centuries-old tradition of Nakshi Kantha — the embroidered quilts of rural Bengal — Nongor brings hand craftsmanship into everyday wear. Our artisans, mostly women from Jamalpur and Tangail, sew each kurti by hand in small batches, never in factories.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div><div className="font-display text-3xl text-gold">14 days</div><div className="text-sm text-primary-foreground/70">Average craft time per kurti</div></div>
              <div><div className="font-display text-3xl text-gold">Fair</div><div className="text-sm text-primary-foreground/70">Wages paid directly to artisans</div></div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY NONGOR */}
      <section className="container-narrow py-16">
        <SectionHeading eyebrow="The Nongor promise" title="Why choose us" center />
        <div className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: Heart, title: "Handmade with Care", desc: "Sewn one at a time by women artisans" },
            { icon: Scissors, title: "Premium Fabric", desc: "Sourced from Tangail & Jamalpur weavers" },
            { icon: Sparkles, title: "Cultural Design", desc: "Nakshi-inspired motifs, modern fits" },
            { icon: ShieldCheck, title: "Secure Order", desc: "bKash, Nagad, COD — verified delivery" },
          ].map((f, i) => (
            <div key={i} className="bg-card rounded-2xl p-6 text-center shadow-soft hover:shadow-elegant transition">
              <div className="h-12 w-12 mx-auto rounded-full bg-cream grid place-items-center text-maroon"><f.icon className="h-5 w-5" /></div>
              <div className="mt-4 font-display text-lg">{f.title}</div>
              <div className="mt-1 text-xs md:text-sm text-muted-foreground">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="container-narrow py-10">
        <SectionHeading eyebrow="Loved by many" title="Best Sellers" />
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6">
          {bestSellers.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="container-narrow py-16">
        <SectionHeading eyebrow="Customer stories" title="What they say" center />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.id} className="bg-card rounded-2xl p-7 shadow-soft border border-border/40">
              <div className="text-gold">{"★".repeat(t.rating)}</div>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">"{t.text}"</p>
              <div className="mt-5 pt-4 border-t border-border/50">
                <div className="font-medium text-sm">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.location}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* INSTAGRAM */}
      <section className="container-narrow py-10">
        <SectionHeading eyebrow="Follow @nongor.bd" title="From the studio" />
        <div className="mt-8 grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {products.slice(0, 6).map((p) => (
            <div key={p.id} className="aspect-square rounded-xl overflow-hidden bg-cream">
              <img src={p.images[0]} alt="" className="w-full h-full object-cover hover:scale-110 transition duration-700" />
            </div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="container-narrow py-16">
        <div className="relative overflow-hidden rounded-3xl bg-cream pattern-nakshi p-8 md:p-14 text-center">
          <Truck className="h-8 w-8 text-gold mx-auto" />
          <h3 className="mt-4 font-display text-3xl md:text-4xl text-maroon">Join the Nongor circle</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">Be the first to see new drops and receive 10% off your first order.</p>
          <form className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className="flex-1 px-5 py-3 rounded-full bg-card border border-border focus:border-maroon outline-none text-sm" />
            <button className="bg-maroon hover:bg-maroon-deep text-primary-foreground px-7 py-3 rounded-full text-sm font-semibold transition">Subscribe</button>
          </form>
        </div>
      </section>
    </div>
  );
}

function SectionHeading({ eyebrow, title, center }: { eyebrow: string; title: string; center?: boolean }) {
  return (
    <div className={center ? "text-center" : ""}>
      <div className="text-xs uppercase tracking-[0.3em] text-gold font-medium">{eyebrow}</div>
      <h2 className="mt-2 font-display text-3xl md:text-4xl text-foreground">{title}</h2>
    </div>
  );
}

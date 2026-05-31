import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Heart, Scissors, Sparkles, ShieldCheck, Leaf, Users } from "lucide-react";

export const Route = createFileRoute("/_shop/about")({
  head: () => ({
    meta: [
      { title: "About Nongor — Handmade in Bangladesh" },
      {
        name: "description",
        content:
          "Nongor — নোঙর — is a boutique of hand-stitched kurti, sewn one piece at a time by women artisans across rural Bangladesh.",
      },
      { property: "og:title", content: "About Nongor — Handmade in Bangladesh" },
      {
        property: "og:description",
        content: "A boutique brand carrying the soul of Nakshi Kantha into modern wear.",
      },
    ],
  }),
  component: About,
});

function About() {
  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream to-ivory">
        <div className="absolute inset-0 pattern-nakshi opacity-30" />
        <div className="container-narrow relative py-16 md:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-ivory/70 border border-gold/40 rounded-full px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] text-maroon font-medium">
            <Sparkles className="h-3 w-3 text-gold" /> Our Story
          </div>
          <h1 className="mt-6 font-display text-4xl md:text-6xl lg:text-7xl text-foreground leading-[1.05]">
            The soul of <span className="italic text-maroon">Bengal</span>,<br />
            stitched into every thread
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed">
            <span className="font-bengali text-maroon">নোঙর</span> means anchor — a quiet promise to
            hold on to craft, to women makers, and to the soft rhythm of slow fashion.
          </p>
        </div>
      </section>

      {/* FOUNDER NOTE */}
      <section className="container-narrow py-16 md:py-24 grid lg:grid-cols-2 gap-12 items-center">
        <div className="relative">
          <div className="absolute -inset-6 bg-gradient-to-br from-gold/20 via-maroon/10 to-transparent rounded-[3rem] blur-2xl" />
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden shadow-elegant">
            <img
              src="https://images.unsplash.com/photo-1606902965551-dce093cda6e7?auto=format&fit=crop&w=900&q=80"
              alt="Artisan stitching a kurti by hand"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep font-medium">
            A note from the founder
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-5xl leading-tight">Where it began</h2>
          <p className="mt-5 text-foreground/85 leading-relaxed">
            Nongor was born from a small studio in Dhaka, where a handful of women sat under
            afternoon light — needles in hand, stories in their stitches. We were never interested
            in mass production. We wanted to make clothes the old way: slowly, carefully, and with
            the people who keep this craft alive.
          </p>
          <p className="mt-4 text-foreground/85 leading-relaxed">
            Today, every Nongor kurti is still sewn by hand. No factories. No shortcuts. Just
            thread, fabric, and the quiet patience of women who treat each piece as their own.
          </p>
          <div className="mt-8 flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-cream grid place-items-center text-maroon">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <div className="font-display text-lg">Tasnim Rahman</div>
              <div className="text-xs text-muted-foreground uppercase tracking-[0.2em]">
                Founder · Nongor
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VALUES */}
      <section className="bg-cream/60 border-y border-hairline">
        <div className="container-narrow py-16 md:py-20">
          <div className="text-center">
            <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep font-medium">
              What we hold close
            </div>
            <h2 className="mt-3 font-display text-3xl md:text-4xl">Our values</h2>
          </div>
          <div className="mt-12 grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Scissors,
                title: "Hand-stitched",
                desc: "Every kurti is sewn one piece at a time, never machine-rushed.",
              },
              {
                icon: Users,
                title: "Women-led craft",
                desc: "We work with women artisans across rural Bangladesh.",
              },
              {
                icon: Leaf,
                title: "Small batches",
                desc: "We make a few of each piece — no overproduction, no waste.",
              },
              {
                icon: ShieldCheck,
                title: "Honest pricing",
                desc: "Fair to the maker, fair to you — no inflated boutique markups.",
              },
            ].map((v) => (
              <div
                key={v.title}
                className="bg-ivory rounded-2xl p-7 shadow-soft hover:shadow-elegant transition border border-hairline/60"
              >
                <div className="h-12 w-12 rounded-full bg-cream grid place-items-center text-maroon">
                  <v.icon className="h-5 w-5" />
                </div>
                <div className="mt-5 font-display text-xl">{v.title}</div>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="container-narrow py-16 md:py-24">
        <div className="text-center">
          <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep font-medium">
            From thread to thread
          </div>
          <h2 className="mt-3 font-display text-3xl md:text-4xl">How a Nongor piece is made</h2>
        </div>
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Fabric sourcing",
              desc: "We choose breathable cotton, slubby khadi and soft handloom — woven in Bangladeshi mills.",
            },
            {
              step: "02",
              title: "Hand embroidery",
              desc: "Motifs inspired by Nakshi Kantha are stitched by hand over days, sometimes weeks.",
            },
            {
              step: "03",
              title: "Final finishing",
              desc: "Each piece is checked, pressed and packed in our Dhaka studio before it ships to you.",
            },
          ].map((s) => (
            <div key={s.step} className="relative rounded-2xl border border-hairline bg-card p-7">
              <div className="font-display text-5xl text-gold/80">{s.step}</div>
              <div className="mt-3 font-display text-xl">{s.title}</div>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container-narrow pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-maroon to-maroon-deep text-primary-foreground p-10 md:p-16 text-center">
          <div className="absolute inset-0 pattern-nakshi opacity-10" />
          <div className="relative">
            <h3 className="font-display text-3xl md:text-5xl">Wear a piece of the story</h3>
            <p className="mt-3 text-primary-foreground/85 max-w-md mx-auto">
              Discover this season's handmade collection — small batches, big stories.
            </p>
            <Link
              to="/shop"
              className="mt-8 inline-flex items-center gap-2 bg-ivory text-maroon hover:bg-cream px-7 py-3.5 rounded-full text-sm font-semibold transition shadow-elegant"
            >
              Shop Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

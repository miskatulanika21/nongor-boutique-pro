import { Link, createFileRoute } from "@tanstack/react-router";
import { Ruler, ThermometerSun, UserRound, Scissors, ArrowRight } from "lucide-react";
import figureImg from "@/assets/size-guide-figure.png";

export const Route = createFileRoute("/_shop/size-guide")({
  head: () => ({
    meta: [
      { title: "Size Guide — How to Measure | Nongor (নোঙর)" },
      {
        name: "description",
        content:
          "Learn how to measure for the perfect-fit Nongor kurti. Bust, waist, hip, shoulder, sleeve and length explained.",
      },
      { property: "og:title", content: "Size Guide — Nongor" },
      {
        property: "og:description",
        content: "How to take accurate measurements for your custom Nongor kurti.",
      },
    ],
  }),
  component: SizeGuidePage,
});

const MEASUREMENTS = [
  {
    n: 1,
    name: "Bust",
    text: "Measure around the fullest part of your chest. Keep the tape parallel to the floor.",
  },
  {
    n: 2,
    name: "Waist",
    text: "Measure around the narrowest part of your natural waistline, just above the belly button.",
  },
  {
    n: 3,
    name: "Hip",
    text: "Measure around the fullest part of your hips, about 8 inches below your waist.",
  },
  {
    n: 4,
    name: "Shoulder",
    text: "Measure across your back from the tip of one shoulder to the other.",
  },
  {
    n: 5,
    name: "Sleeve",
    text: "Measure from the shoulder seam down to where you want the sleeve to end.",
  },
  {
    n: 6,
    name: "Length",
    text: "Measure from the shoulder down to where you want the kurti hem to fall.",
  },
];

const SIZE_TABLE = [
  { size: "S", bust: "34", waist: "28", hip: "36", length: "42" },
  { size: "M", bust: "36", waist: "30", hip: "38", length: "43" },
  { size: "L", bust: "38", waist: "32", hip: "40", length: "44" },
  { size: "XL", bust: "40", waist: "34", hip: "42", length: "44" },
  { size: "XXL", bust: "42", waist: "36", hip: "44", length: "45" },
];

const TIPS = [
  {
    icon: Scissors,
    title: "Use a soft measuring tape",
    text: "A flexible cloth tape gives the most accurate body measurements.",
  },
  {
    icon: UserRound,
    title: "Ask for help",
    text: "Some measurements like shoulder are easier with a friend's help.",
  },
  {
    icon: ThermometerSun,
    title: "Wear light clothes",
    text: "Measure over a thin t-shirt — never over thick layers.",
  },
  {
    icon: Ruler,
    title: "Keep tape snug, not tight",
    text: "The tape should sit flat on your body without compressing skin.",
  },
];

function SizeGuidePage() {
  return (
    <div className="container-narrow py-12 md:py-16">
      <div className="text-center mb-12">
        <div className="text-xs uppercase tracking-[0.3em] text-gold-deep font-semibold">
          নোঙর · Size Guide
        </div>
        <h1 className="mt-2 font-display text-4xl md:text-5xl lg:text-6xl text-foreground">
          How to Measure
        </h1>
        <p className="font-bengali text-sm md:text-base text-muted-foreground mt-2">
          পারফেক্ট ফিটের জন্য মাপ নেওয়ার নিয়ম
        </p>
        <div className="mx-auto mt-4 h-px w-20 bg-gold" />
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        {/* Body figure — complete illustrated image */}
        <div className="rounded-3xl overflow-hidden shadow-soft">
          <img
            src={figureImg}
            alt="Female figure illustration showing where to take kurti measurements — Bust, Waist, Hip, Shoulder, Sleeve, and Length"
            className="w-full h-auto"
          />
        </div>

        {/* Instructions */}
        <ol className="space-y-6">
          {MEASUREMENTS.map((m) => (
            <li
              key={m.n}
              className="flex gap-4 animate-fade-up"
              style={{ animationDelay: `${m.n * 100}ms` }}
            >
              <div className="h-9 w-9 rounded-full bg-maroon text-primary-foreground flex items-center justify-center font-display text-sm font-semibold flex-shrink-0 shadow-soft">
                {m.n}
              </div>
              <div>
                <h3 className="font-display text-xl text-charcoal font-semibold">{m.name}</h3>
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{m.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Size reference table */}
      <section className="mt-20">
        <h2 className="font-display text-3xl md:text-4xl text-foreground text-center mb-2">
          Size Reference Chart
        </h2>
        <p className="text-xs text-muted-foreground text-center uppercase tracking-wider mb-8">
          All measurements in inches
        </p>
        <div className="overflow-hidden border border-border/40 rounded-2xl shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-maroon text-primary-foreground">
                  <th className="text-left px-6 py-4 font-semibold tracking-wider text-xs uppercase">
                    Size
                  </th>
                  <th className="text-left px-6 py-4 font-semibold tracking-wider text-xs uppercase">
                    Bust
                  </th>
                  <th className="text-left px-6 py-4 font-semibold tracking-wider text-xs uppercase">
                    Waist
                  </th>
                  <th className="text-left px-6 py-4 font-semibold tracking-wider text-xs uppercase">
                    Hip
                  </th>
                  <th className="text-left px-6 py-4 font-semibold tracking-wider text-xs uppercase">
                    Length
                  </th>
                </tr>
              </thead>
              <tbody>
                {SIZE_TABLE.map((row, i) => (
                  <tr
                    key={row.size}
                    className={`border-t border-border/30 transition hover:bg-cream/20 ${i % 2 === 1 ? "bg-cream/40" : ""}`}
                  >
                    <td className="px-6 py-4 font-display font-bold text-maroon text-base">
                      {row.size}
                    </td>
                    <td className="px-6 py-4 text-foreground/80 font-medium">{row.bust}"</td>
                    <td className="px-6 py-4 text-foreground/80 font-medium">{row.waist}"</td>
                    <td className="px-6 py-4 text-foreground/80 font-medium">{row.hip}"</td>
                    <td className="px-6 py-4 text-foreground/80 font-medium">{row.length}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="mt-20">
        <h2 className="font-display text-2xl md:text-3xl text-foreground text-center mb-8">
          Tips for Accurate Measurements
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {TIPS.map((t) => (
            <div
              key={t.title}
              className="flex gap-4 p-5 bg-cream/50 rounded-2xl border border-gold/15 shadow-soft transition hover:shadow-elegant"
            >
              <div className="h-10 w-10 bg-ivory rounded-xl flex items-center justify-center flex-shrink-0 shadow-soft text-maroon">
                <t.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-charcoal">{t.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{t.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <div className="mt-20 text-center bg-cream border border-gold/30 rounded-3xl p-8 md:p-12 shadow-elegant relative overflow-hidden">
        <div className="absolute inset-0 pattern-nakshi opacity-[0.04]" />
        <div className="relative z-10">
          <h3 className="font-display text-3xl md:text-4xl text-charcoal font-semibold">
            Ready to customize?
          </h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto leading-relaxed">
            Pick a beautiful hand-crafted kurti and let us tailor it to your exact measurements for
            a flawless fit.
          </p>
          <Link
            to="/product/$slug"
            params={{ slug: "maroon-nakshi-handmade-kurti" }}
            className="mt-6 inline-flex items-center gap-2 btn-maroon rounded-full px-8 py-3.5 text-xs uppercase font-semibold tracking-wider transition shadow-soft cursor-pointer border-0"
          >
            Start Custom Order <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

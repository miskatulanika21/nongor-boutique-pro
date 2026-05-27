import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Mail, MapPin, Phone, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-charcoal text-primary-foreground mt-24 md:mt-32 relative overflow-hidden">
      <div className="absolute inset-0 pattern-nakshi opacity-[0.06] pointer-events-none" />
      <div className="pattern-stitch h-[3px] opacity-70" />
      <div className="container-narrow relative py-16 md:py-20 grid grid-cols-2 md:grid-cols-12 gap-10">
        <div className="col-span-2 md:col-span-5">
          <Logo dark />
          <p className="mt-5 text-sm text-primary-foreground/70 max-w-sm leading-relaxed">
            <span className="font-bengali text-gold">নোঙর</span> — a Bangladeshi handmade women's clothing house. Every kurti is hand-stitched by skilled artisans, rooted in cultural craft and built to last.
          </p>
          <div className="mt-7 flex gap-3">
            <a
              className="h-10 w-10 grid place-items-center rounded-full border border-primary-foreground/15 hover:bg-gold hover:text-gold-foreground hover:border-gold transition ease-soft"
              href="#"
              aria-label="Facebook"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              className="h-10 w-10 grid place-items-center rounded-full border border-primary-foreground/15 hover:bg-gold hover:text-gold-foreground hover:border-gold transition ease-soft"
              href="#"
              aria-label="Instagram"
            >
              <Instagram className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[11px] uppercase tracking-[0.22em] text-gold mb-4">Shop</h4>
          <ul className="space-y-2.5 text-sm text-primary-foreground/75">
            <li><Link to="/shop" className="hover:text-gold transition">All Kurti</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition">New Arrivals</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition">Best Sellers</Link></li>
            <li><Link to="/shop" className="hover:text-gold transition">Festive</Link></li>
          </ul>
        </div>

        <div className="md:col-span-2">
          <h4 className="text-[11px] uppercase tracking-[0.22em] text-gold mb-4">Help</h4>
          <ul className="space-y-2.5 text-sm text-primary-foreground/75">
            <li><Link to="/track-order" className="hover:text-gold transition">Track Order</Link></li>
            <li className="hover:text-gold transition cursor-pointer">Return & Exchange</li>
            <li className="hover:text-gold transition cursor-pointer">Size Guide</li>
            <li className="hover:text-gold transition cursor-pointer">Contact Us</li>
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="text-[11px] uppercase tracking-[0.22em] text-gold mb-4">Visit Us</h4>
          <ul className="space-y-3 text-sm text-primary-foreground/75">
            <li className="flex items-start gap-2.5"><MapPin className="h-4 w-4 text-gold mt-0.5 shrink-0" /> Dhanmondi 27, Dhaka, Bangladesh</li>
            <li className="flex items-center gap-2.5"><Phone className="h-4 w-4 text-gold" /> +880 1700-000000</li>
            <li className="flex items-center gap-2.5"><Mail className="h-4 w-4 text-gold" /> hello@nongor.com.bd</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10">
        <div className="container-narrow py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-primary-foreground/55">
          <div>© {new Date().getFullYear()} Nongor — নোঙর. All rights reserved.</div>
          <div className="flex items-center gap-1.5">
            Handmade with <Heart className="h-3 w-3 fill-gold text-gold" /> in Bangladesh
          </div>
          <div className="flex gap-4">
            <span className="hover:text-gold transition cursor-pointer">Privacy</span>
            <span className="hover:text-gold transition cursor-pointer">Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

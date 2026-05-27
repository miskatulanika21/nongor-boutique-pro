import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";
import { Facebook, Instagram, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-maroon text-primary-foreground mt-20">
      <div className="pattern-stitch h-1 opacity-60" />
      <div className="container-narrow py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
        <div className="col-span-2">
          <Logo dark />
          <p className="mt-4 text-sm text-primary-foreground/80 max-w-sm leading-relaxed">
            Nongor is a Bangladeshi handmade women's clothing house — every kurti is hand-stitched by skilled artisans, rooted in cultural craft and built to last.
          </p>
          <div className="mt-6 flex gap-3">
            <a className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/30 hover:bg-gold hover:text-gold-foreground transition" href="#"><Facebook className="h-4 w-4" /></a>
            <a className="h-9 w-9 grid place-items-center rounded-full border border-primary-foreground/30 hover:bg-gold hover:text-gold-foreground transition" href="#"><Instagram className="h-4 w-4" /></a>
          </div>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Shop</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/shop">All Kurti</Link></li>
            <li><Link to="/shop">New Arrivals</Link></li>
            <li><Link to="/shop">Best Sellers</Link></li>
            <li><Link to="/shop">Festive Collection</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-lg mb-4 text-gold">Help</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/80">
            <li><Link to="/track-order">Track Order</Link></li>
            <li>Return & Exchange</li>
            <li>Size Guide</li>
            <li>Contact Us</li>
          </ul>
        </div>
        <div className="col-span-2 md:col-span-4 border-t border-primary-foreground/15 pt-8 grid md:grid-cols-3 gap-4 text-sm text-primary-foreground/80">
          <div className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gold" /> Dhanmondi, Dhaka, Bangladesh</div>
          <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-gold" /> +880 1700-000000</div>
          <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-gold" /> hello@nongor.com.bd</div>
        </div>
      </div>
      <div className="border-t border-primary-foreground/10 py-4 text-center text-xs text-primary-foreground/60">
        © {new Date().getFullYear()} Nongor — নোঙর. Handmade in Bangladesh.
      </div>
    </footer>
  );
}

import { Link } from "@tanstack/react-router";
import logo from "@/assets/nongor-logo.png";

export function Logo({
  className = "",
  showText = true,
  dark = false,
}: {
  className?: string;
  showText?: boolean;
  dark?: boolean;
}) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <img src={logo} alt="Nongor" className="h-10 w-10 object-contain" />
      {showText && (
        <div className="leading-none">
          <div
            className={`font-display text-xl font-semibold tracking-wide ${dark ? "text-sidebar-foreground" : "text-maroon"}`}
          >
            NONGOR
          </div>
          <div
            className={`font-bengali text-[11px] tracking-wider ${dark ? "text-sidebar-foreground/70" : "text-gold"}`}
          >
            নোঙর
          </div>
        </div>
      )}
    </Link>
  );
}

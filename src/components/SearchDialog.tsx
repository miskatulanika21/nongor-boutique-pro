import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useShop } from "@/store/shop";
import { products, categories } from "@/data/mock";
import { taka } from "@/lib/format";
import { Link, useNavigate } from "@tanstack/react-router";
import { Search, X, TrendingUp, Clock, Sparkles, ArrowUpRight, CornerDownLeft } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

const RECENTS_KEY = "nongor:recent-searches";
const allSizes = ["S", "M", "L", "XL", "XXL"];
const trending = [
  "Maroon kurti",
  "Festive collection",
  "Nakshi",
  "Handloom",
  "Ivory cotton",
  "Under ৳2,500",
];

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
};

export function SearchDialog({ open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const { wishlist } = useShop();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);
  const [recents, setRecents] = useState<string[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recents
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTS_KEY);
      if (raw) setRecents(JSON.parse(raw));
    } catch {
      /* noop */
    }
  }, []);

  // Reset & focus on open
  useEffect(() => {
    if (open) {
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ("");
      setCat(null);
      setSize(null);
    }
  }, [open]);

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    const r = products.filter((p) => {
      if (cat && !p.collection.includes(cat) && p.category !== cat) return false;
      if (size && !p.sizes.includes(size)) return false;
      if (!term) return true;
      return (
        p.name.toLowerCase().includes(term) ||
        p.fabric.toLowerCase().includes(term) ||
        p.colors.some((c) => c.name.toLowerCase().includes(term)) ||
        p.collection.some((c) => c.toLowerCase().includes(term))
      );
    });
    return r.slice(0, 6);
  }, [q, cat, size]);

  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return [];
    const pool = new Set<string>();
    products.forEach((p) => {
      if (p.name.toLowerCase().includes(term)) pool.add(p.name);
      p.collection.forEach((c) => c.toLowerCase().includes(term) && pool.add(c));
      p.colors.forEach((c) => c.name.toLowerCase().includes(term) && pool.add(`${c.name} kurti`));
      if (p.fabric.toLowerCase().includes(term)) pool.add(p.fabric);
    });
    return Array.from(pool).slice(0, 5);
  }, [q]);

  const pushRecent = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    const next = [
      trimmed,
      ...recents.filter((r) => r.toLowerCase() !== trimmed.toLowerCase()),
    ].slice(0, 6);
    setRecents(next);
    try {
      localStorage.setItem(RECENTS_KEY, JSON.stringify(next));
    } catch {
      /* noop */
    }
  };

  const submit = (term?: string) => {
    const value = (term ?? q).trim();
    if (value) pushRecent(value);
    onOpenChange(false);
    navigate({
      to: "/shop",
      search: {
        ...(value ? { q: value } : {}),
        ...(cat ? { category: cat } : {}),
        ...(size ? { size } : {}),
      } as never,
    });
  };

  const goToProduct = (slug: string, name: string) => {
    pushRecent(name);
    onOpenChange(false);
    navigate({ to: "/product/$slug", params: { slug } });
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const r = results[active];
      if (r) goToProduct(r.slug, r.name);
      else submit();
    }
  };

  const clearRecents = () => {
    setRecents([]);
    try {
      localStorage.removeItem(RECENTS_KEY);
    } catch {
      /* noop */
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 gap-0 max-w-2xl bg-ivory border-hairline rounded-2xl overflow-hidden shadow-elegant top-[8%] translate-y-0 sm:top-[12%]">
        {/* Header / Input */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-hairline">
          <Search className="h-5 w-5 text-maroon shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder="Search handmade kurti, fabric, colour…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground/70"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="p-1 rounded-full hover:bg-cream text-muted-foreground"
              aria-label="Clear"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] tracking-wider text-muted-foreground border border-hairline rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        {/* Filter chips */}
        <div className="px-5 py-3 border-b border-hairline flex flex-wrap items-center gap-2 bg-cream/40">
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mr-1">
            Category
          </span>
          {categories
            .filter((c) => c.status === "Active")
            .map((c) => (
              <Chip
                key={c.id}
                active={cat === c.name}
                onClick={() => setCat(cat === c.name ? null : c.name)}
              >
                {c.name}
              </Chip>
            ))}
          <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground ml-2 mr-1">
            Size
          </span>
          {allSizes.map((s) => (
            <Chip key={s} active={size === s} onClick={() => setSize(size === s ? null : s)}>
              {s}
            </Chip>
          ))}
        </div>

        {/* Body */}
        <div className="max-h-[60vh] overflow-y-auto">
          {/* Empty state */}
          {!q && !cat && !size && (
            <div className="p-5 grid sm:grid-cols-2 gap-6">
              <Section title="Trending" icon={<TrendingUp className="h-3.5 w-3.5 text-gold" />}>
                <div className="flex flex-wrap gap-2">
                  {trending.map((t) => (
                    <button
                      key={t}
                      onClick={() => submit(t)}
                      className="px-3 py-1.5 rounded-full bg-ivory border border-hairline text-xs hover:border-maroon hover:text-maroon transition"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </Section>
              <Section
                title="Recent"
                icon={<Clock className="h-3.5 w-3.5 text-muted-foreground" />}
                action={
                  recents.length > 0 ? (
                    <button
                      onClick={clearRecents}
                      className="text-[11px] text-muted-foreground hover:text-maroon"
                    >
                      Clear
                    </button>
                  ) : null
                }
              >
                {recents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No recent searches yet.</p>
                ) : (
                  <ul className="space-y-1">
                    {recents.map((r) => (
                      <li key={r}>
                        <button
                          onClick={() => submit(r)}
                          className="w-full flex items-center justify-between text-sm py-1.5 px-2 -mx-2 rounded hover:bg-cream/70 group"
                        >
                          <span className="flex items-center gap-2 text-foreground/85">
                            <Search className="h-3.5 w-3.5 text-muted-foreground" />
                            {r}
                          </span>
                          <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </Section>
              <div className="sm:col-span-2">
                <Section
                  title="You may also love"
                  icon={<Sparkles className="h-3.5 w-3.5 text-gold" />}
                >
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {products
                      .filter((p) => p.isBestSeller || p.featured)
                      .slice(0, 3)
                      .map((p) => (
                        <button
                          key={p.id}
                          onClick={() => goToProduct(p.slug, p.name)}
                          className="text-left group"
                        >
                          <div className="aspect-[4/5] rounded-lg overflow-hidden bg-cream">
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          <div className="mt-2 text-xs font-medium line-clamp-1 group-hover:text-maroon">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-maroon">
                            {taka(p.discountPrice ?? p.price)}
                          </div>
                        </button>
                      ))}
                  </div>
                </Section>
              </div>
            </div>
          )}

          {/* Suggestions row */}
          {q && suggestions.length > 0 && (
            <div className="px-5 pt-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
                Suggestions
              </div>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => submit(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-ivory border border-hairline hover:border-gold hover:text-maroon transition"
                  >
                    <span dangerouslySetInnerHTML={{ __html: highlight(s, q) }} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          {(q || cat || size) && (
            <div className="p-5 pt-4">
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 flex justify-between">
                <span>{results.length} matches</span>
                {(cat || size || q) && (
                  <button
                    onClick={() => submit()}
                    className="text-gold hover:text-maroon normal-case tracking-normal text-xs flex items-center gap-1"
                  >
                    View all <ArrowUpRight className="h-3 w-3" />
                  </button>
                )}
              </div>
              {results.length === 0 ? (
                <div className="text-center py-10">
                  <div className="font-display text-lg text-maroon">No pieces matched</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Try a different colour, fabric or size.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-hairline/70">
                  {results.map((p, i) => (
                    <li key={p.id}>
                      <button
                        onMouseEnter={() => setActive(i)}
                        onClick={() => goToProduct(p.slug, p.name)}
                        className={`w-full flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg transition ${
                          active === i ? "bg-cream/80" : "hover:bg-cream/50"
                        }`}
                      >
                        <img
                          src={p.images[0]}
                          alt={p.name}
                          className="h-14 w-12 rounded-md object-cover shrink-0"
                        />
                        <div className="flex-1 min-w-0 text-left">
                          <div
                            className="text-sm font-medium line-clamp-1"
                            dangerouslySetInnerHTML={{ __html: highlight(p.name, q) }}
                          />
                          <div className="text-[11px] text-muted-foreground line-clamp-1">
                            {p.fabric} · {p.colors.map((c) => c.name).join(", ")}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm text-maroon font-medium">
                            {taka(p.discountPrice ?? p.price)}
                          </div>
                          {p.discountPrice && (
                            <div className="text-[10px] line-through text-muted-foreground">
                              {taka(p.price)}
                            </div>
                          )}
                        </div>
                        {active === i && (
                          <CornerDownLeft className="h-4 w-4 text-gold ml-1 hidden sm:block" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-2.5 border-t border-hairline flex items-center justify-between text-[11px] text-muted-foreground bg-cream/40">
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <Kbd>↵</Kbd> select
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-bengali text-maroon">নোঙর</span>
            <span>· {wishlist.length} saved</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Chip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full border transition ${
        active
          ? "bg-maroon text-primary-foreground border-maroon"
          : "bg-ivory border-hairline hover:border-maroon"
      }`}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  icon,
  action,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          {icon}
          {title}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center text-[10px] border border-hairline bg-ivory rounded px-1 py-0.5">
      {children}
    </kbd>
  );
}

function highlight(text: string, query: string) {
  const term = query.trim();
  if (!term) return escapeHtml(text);
  const safe = escapeHtml(text);
  const re = new RegExp(`(${escapeRegex(term)})`, "ig");
  return safe.replace(re, '<mark class="bg-gold/30 text-maroon rounded px-0.5">$1</mark>');
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!,
  );
}
function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Keyboard shortcut hook
export function useSearchShortcut(onTrigger: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        onTrigger();
      } else if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        onTrigger();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onTrigger]);
}

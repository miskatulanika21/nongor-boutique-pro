import { useMemo, useState } from "react";
import { Star, ThumbsUp, ShieldCheck, Camera, ChevronDown, PenLine } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

type Review = {
  id: string;
  name: string;
  initials: string;
  rating: number;
  date: string;
  size: string;
  body: string;
  photos?: string[];
  verified: boolean;
  helpful: number;
};

// Deterministic mock review generator seeded by product id so each PDP has stable reviews
function mockReviews(seed: string, avg: number, count: number, productImages: string[]): Review[] {
  const names = [
    ["Tasnim", "R."],
    ["Nusrat", "J."],
    ["Sadia", "I."],
    ["Mehnaz", "K."],
    ["Rumana", "A."],
    ["Farah", "H."],
    ["Anika", "T."],
    ["Sumaiya", "B."],
    ["Lamia", "S."],
    ["Sabrina", "M."],
    ["Maliha", "P."],
    ["Tahmina", "Q."],
  ];
  const sizes = ["S", "M", "L", "XL"];
  const bodies = [
    "The stitching detail is gorgeous and the fabric feels premium. Fit is true to size.",
    "Wore it for Eid and got so many compliments. The color is even richer in person.",
    "Quality is exceptional for the price. You can tell it’s handmade — every stitch is intentional.",
    "Loved the cut and the breathable fabric. Will be ordering more from Nongor.",
    "The hand embroidery is delicate and very neat. Shipping was quick too.",
    "Beautiful piece, fits well after a gentle wash. Highly recommend the maroon shade.",
    "Soft on the skin, drapes beautifully. Genuinely boutique quality.",
    "Exactly as pictured. The thread work has a lovely subtle shine in daylight.",
  ];
  let s = 0;
  for (let i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
  const n = Math.min(Math.max(count, 4), 12);
  return Array.from({ length: n }, (_, i) => {
    const ratingPick = rand();
    const rating = ratingPick < 0.7 ? 5 : ratingPick < 0.9 ? 4 : ratingPick < 0.97 ? 3 : 2;
    const adjusted = Math.max(1, Math.min(5, Math.round((rating + avg) / 2)));
    const [first, last] = names[i % names.length];
    const daysAgo = Math.floor(rand() * 90) + 1;
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const withPhoto = rand() < 0.35 && productImages.length > 0;
    return {
      id: `${seed}-${i}`,
      name: `${first} ${last}`,
      initials: `${first[0]}${last[0]}`,
      rating: adjusted,
      date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      size: sizes[Math.floor(rand() * sizes.length)],
      body: bodies[Math.floor(rand() * bodies.length)],
      photos: withPhoto ? [productImages[Math.floor(rand() * productImages.length)]] : undefined,
      verified: rand() < 0.85,
      helpful: Math.floor(rand() * 28),
    };
  });
}

export function ProductReviews({
  productId,
  rating,
  reviewCount,
  images,
}: {
  productId: string;
  rating: number;
  reviewCount: number;
  images: string[];
}) {
  const all = useMemo(
    () => mockReviews(productId, rating, reviewCount, images),
    [productId, rating, reviewCount, images],
  );
  const [filter, setFilter] = useState<number | "all" | "photos">("all");
  const [sort, setSort] = useState<"newest" | "helpful" | "high" | "low">("helpful");
  const [visible, setVisible] = useState(4);
  const [helpfulIds, setHelpfulIds] = useState<Set<string>>(new Set());

  const dist = useMemo(() => {
    const d = [0, 0, 0, 0, 0]; // index 0 = 5★
    all.forEach((r) => {
      d[5 - r.rating]++;
    });
    return d;
  }, [all]);

  const filtered = useMemo(() => {
    let list = all;
    if (filter === "photos") list = list.filter((r) => r.photos && r.photos.length);
    else if (typeof filter === "number") list = list.filter((r) => r.rating === filter);
    const sorted = [...list];
    if (sort === "helpful") sorted.sort((a, b) => b.helpful - a.helpful);
    else if (sort === "high") sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === "low") sorted.sort((a, b) => a.rating - b.rating);
    else sorted.sort((a, b) => (a.date < b.date ? 1 : -1));
    return sorted;
  }, [all, filter, sort]);

  const toggleHelpful = (id: string) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <section className="mt-16 md:mt-20">
      <div className="text-[11px] uppercase tracking-[0.3em] text-gold-deep font-medium">
        Customer love
      </div>
      <h2 className="mt-2 font-display text-3xl md:text-4xl text-foreground">Reviews & ratings</h2>

      <div className="mt-6 grid md:grid-cols-[280px_1fr] gap-8 md:gap-10 items-start">
        <div className="bg-cream rounded-2xl p-6 text-center md:text-left">
          <div className="font-display text-6xl text-maroon leading-none">{rating.toFixed(1)}</div>
          <div className="mt-2 flex items-center justify-center md:justify-start gap-0.5 text-gold">
            {[1, 2, 3, 4, 5].map((i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${i <= Math.round(rating) ? "fill-gold" : "opacity-30"}`}
              />
            ))}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">Based on {reviewCount} reviews</div>
          <div className="mt-5 space-y-1.5">
            {dist.map((count, idx) => {
              const stars = 5 - idx;
              const pct = all.length ? (count / all.length) * 100 : 0;
              return (
                <button
                  key={stars}
                  onClick={() => setFilter(filter === stars ? "all" : stars)}
                  className="w-full flex items-center gap-2 text-xs group"
                >
                  <span className="w-6 text-muted-foreground">{stars}★</span>
                  <span className="flex-1 h-1.5 bg-ivory rounded-full overflow-hidden">
                    <span
                      className={`block h-full rounded-full transition ${filter === stars ? "bg-maroon" : "bg-gold group-hover:bg-maroon"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </span>
                  <span className="w-6 text-right text-muted-foreground tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>
          <WriteReviewDialog />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2 justify-between">
            <div className="flex flex-wrap gap-2">
              <Chip active={filter === "all"} onClick={() => setFilter("all")}>
                All
              </Chip>
              <Chip
                active={filter === "photos"}
                onClick={() => setFilter(filter === "photos" ? "all" : "photos")}
              >
                <Camera className="h-3 w-3" /> With photos
              </Chip>
              {[5, 4, 3].map((s) => (
                <Chip
                  key={s}
                  active={filter === s}
                  onClick={() => setFilter(filter === s ? "all" : s)}
                >
                  {s}★
                </Chip>
              ))}
            </div>
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as typeof sort)}
                className="appearance-none bg-card border border-border rounded-full text-xs pl-3 pr-8 py-1.5 outline-none focus:border-maroon"
              >
                <option value="helpful">Most helpful</option>
                <option value="newest">Newest</option>
                <option value="high">Highest rating</option>
                <option value="low">Lowest rating</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {filtered.slice(0, visible).map((r) => {
              const wasHelpful = helpfulIds.has(r.id);
              return (
                <article key={r.id} className="bg-card rounded-2xl p-5 shadow-soft">
                  <header className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-maroon to-maroon-deep text-primary-foreground grid place-items-center font-display text-sm">
                      {r.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                        <span className="text-sm font-medium text-foreground truncate">
                          {r.name}
                        </span>
                        {r.verified && (
                          <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-maroon bg-cream px-1.5 py-0.5 rounded">
                            <ShieldCheck className="h-3 w-3" /> Verified buyer
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="flex text-gold">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${i <= r.rating ? "fill-gold" : "opacity-30"}`}
                            />
                          ))}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          · {r.date} · Size {r.size}
                        </span>
                      </div>
                    </div>
                  </header>
                  <p className="mt-3 text-sm text-foreground/85 leading-relaxed">{r.body}</p>
                  {r.photos && (
                    <div className="mt-3 flex gap-2">
                      {r.photos.map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt=""
                          className="h-16 w-16 rounded-lg object-cover border border-border"
                        />
                      ))}
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <button
                      onClick={() => toggleHelpful(r.id)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition ${wasHelpful ? "border-maroon text-maroon bg-cream" : "border-border hover:border-maroon"}`}
                    >
                      <ThumbsUp className={`h-3.5 w-3.5 ${wasHelpful ? "fill-maroon" : ""}`} />{" "}
                      Helpful · {r.helpful + (wasHelpful ? 1 : 0)}
                    </button>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center text-sm text-muted-foreground bg-cream rounded-2xl py-10">
                No reviews match this filter.
              </div>
            )}
          </div>

          {visible < filtered.length && (
            <div className="mt-6 text-center">
              <button
                onClick={() => setVisible((v) => v + 4)}
                className="text-sm font-medium text-maroon border border-maroon/30 hover:border-maroon px-5 py-2 rounded-full transition"
              >
                Show more reviews
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full border transition ${active ? "bg-maroon text-primary-foreground border-maroon" : "border-border hover:border-maroon"}`}
    >
      {children}
    </button>
  );
}

function WriteReviewDialog() {
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const submit = () => {
    if (!name.trim() || !text.trim()) {
      toast.error("Please add your name and review");
      return;
    }
    toast.success("Thanks! Your review is pending approval.");
    setOpen(false);
    setText("");
    setName("");
    setRating(5);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="mt-5 inline-flex items-center gap-2 w-full justify-center bg-maroon hover:bg-maroon-deep text-primary-foreground text-sm font-semibold rounded-full py-2.5 transition">
        <PenLine className="h-4 w-4" /> Write a review
      </DialogTrigger>
      <DialogContent>
        <DialogTitle className="font-display text-2xl">Share your experience</DialogTitle>
        <div className="mt-4 space-y-4">
          <div>
            <div className="text-xs text-muted-foreground mb-1.5">Your rating</div>
            <div className="flex gap-1" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHover(i)}
                  onClick={() => setRating(i)}
                  className="p-0.5"
                >
                  <Star
                    className={`h-7 w-7 transition ${i <= (hover || rating) ? "fill-gold text-gold" : "text-muted-foreground/40"}`}
                  />
                </button>
              ))}
            </div>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-2.5 rounded-lg bg-secondary text-sm outline-none border border-transparent focus:border-maroon"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="What did you love? How was the fit and fabric?"
            className="w-full px-4 py-2.5 rounded-lg bg-secondary text-sm outline-none border border-transparent focus:border-maroon resize-none"
          />
          <button
            onClick={submit}
            className="w-full bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-full py-3 text-sm font-semibold transition"
          >
            Submit review
          </button>
          <p className="text-[11px] text-center text-muted-foreground">
            Reviews are moderated before publishing.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

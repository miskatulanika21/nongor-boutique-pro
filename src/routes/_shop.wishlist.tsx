import { createFileRoute, Link } from "@tanstack/react-router";
import { usePublishedProducts } from "@/hooks/useProducts";
import { useShop } from "@/store/shop";
import { ProductCard } from "@/components/ProductCard";
import { Heart, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_shop/wishlist")({
  head: () => ({ meta: [{ title: "Wishlist — Nongor" }] }),
  component: Wishlist,
});

function Wishlist() {
  const { wishlist } = useShop();
  const { products, loading } = usePublishedProducts();

  if (loading) {
    return (
      <div className="container-narrow py-20 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-maroon" />
        <p className="text-sm text-muted-foreground mt-2">Loading wishlist…</p>
      </div>
    );
  }

  const items = products.filter((p) => wishlist.includes(p.id));
  return (
    <div className="container-narrow py-10">
      <h1 className="font-display text-4xl md:text-5xl">Your Wishlist</h1>
      <p className="text-sm text-muted-foreground mt-1">{items.length} saved piece{items.length !== 1 && "s"}</p>
      {items.length === 0 ? (
        <div className="mt-12 bg-card rounded-2xl p-16 text-center">
          <Heart className="h-10 w-10 mx-auto text-maroon" />
          <div className="font-display text-2xl mt-4">No saved pieces yet</div>
          <Link to="/shop" className="mt-5 inline-block bg-maroon text-primary-foreground px-6 py-2.5 rounded-full text-sm font-semibold">Explore Collection</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((p) => <ProductCard key={p.id} p={p} />)}
        </div>
      )}
    </div>
  );
}

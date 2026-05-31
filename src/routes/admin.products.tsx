import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { useAdmin } from "@/store/admin";
import { taka } from "@/lib/format";
import { Plus, Search, Edit, Trash2, X, UploadCloud, Loader2 } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { Product } from "@/data/mock";
import { uploadProductImage, deleteProductImage } from "@/services/storage";

export const Route = createFileRoute("/admin/products")({ component: Page });

function Page() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdmin();
  const [q, setQ] = useState("");
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q.toLowerCase()));

  const openNew = () => {
    setEditProduct(null);
    setDialogOpen(true);
  };
  const openEdit = (p: Product) => {
    setEditProduct(p);
    setDialogOpen(true);
  };
  const handleDelete = (id: string) => {
    if (confirm("Delete this product?")) {
      deleteProduct(id);
      toast.success("Product deleted");
    }
  };

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle={`${products.length} products`}
        actions={
          <button
            onClick={openNew}
            className="bg-maroon text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1"
          >
            <Plus className="h-4 w-4" /> Add Product
          </button>
        }
      />
      <TableShell
        toolbar={
          <>
            <div className="flex items-center bg-secondary rounded-lg px-3 flex-1 max-w-sm">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products..."
                className="bg-transparent outline-none px-2 h-9 text-sm flex-1"
              />
            </div>
            <select className="bg-secondary rounded-lg px-3 h-9 text-sm">
              <option>All categories</option>
              <option>Kurti</option>
            </select>
            <select className="bg-secondary rounded-lg px-3 h-9 text-sm">
              <option>All status</option>
              <option>Published</option>
              <option>Draft</option>
            </select>
          </>
        }
      >
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground">
            <tr>
              <th className="text-left p-3">Product</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Price</th>
              <th className="text-left p-3">Stock</th>
              <th className="text-left p-3">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-t border-border/40">
                <td className="p-3 flex items-center gap-3">
                  <img src={p.images[0]} className="h-12 w-10 rounded object-cover" alt="" />
                  <div>
                    <div className="font-medium">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.slug}</div>
                  </div>
                </td>
                <td className="p-3">{p.category}</td>
                <td className="p-3 font-medium text-maroon">{taka(p.discountPrice ?? p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <StatusPill status={p.status} />
                </td>
                <td className="p-3 text-right">
                  <button onClick={() => openEdit(p)} className="p-1 hover:text-maroon">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(p.id)} className="p-1 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableShell>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogTitle className="font-display text-2xl">
            {editProduct ? "Edit Product" : "Add Product"}
          </DialogTitle>
          <ProductForm
            initial={editProduct}
            onSave={(data) => {
              if (editProduct) {
                updateProduct(editProduct.id, data);
                toast.success("Product updated");
              } else {
                addProduct({ ...data, id: `p-${Date.now()}` } as Product);
                toast.success("Product added");
              }
              setDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductForm({
  initial,
  onSave,
}: {
  initial: Product | null;
  onSave: (data: Partial<Product>) => void;
}) {
  const [name, setName] = useState(initial?.name ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [price, setPrice] = useState(String(initial?.price ?? ""));
  const [discountPrice, setDiscountPrice] = useState(String(initial?.discountPrice ?? ""));
  const [category, setCategory] = useState(initial?.category ?? "Kurti");
  const [occasion, setOccasion] = useState(initial?.occasion ?? "Everyday");
  const [fabric, setFabric] = useState(initial?.fabric ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [stock, setStock] = useState(String(initial?.stock ?? "10"));
  const [sizes, setSizes] = useState(initial?.sizes.join(", ") ?? "S, M, L, XL");
  const [isNew, setIsNew] = useState(initial?.isNew ?? false);
  const [isBest, setIsBest] = useState(initial?.isBestSeller ?? false);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<"Published" | "Draft" | "Archived">(
    initial?.status ?? "Published",
  );

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const tempSlug = slug || name.toLowerCase().replace(/\s+/g, "-") || "new-product";
      for (const file of files) {
        const url = await uploadProductImage(file, tempSlug);
        if (url) {
          setImages((prev) => [...prev, url]);
          toast.success("Image uploaded!");
        } else {
          toast.error("Failed to upload image");
        }
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = async (url: string) => {
    setImages((prev) => prev.filter((img) => img !== url));
    await deleteProductImage(url);
    toast.success("Image removed");
  };

  const submit = () => {
    onSave({
      name,
      slug: slug || name.toLowerCase().replace(/\s+/g, "-"),
      price: Number(price),
      discountPrice: discountPrice ? Number(discountPrice) : undefined,
      category,
      occasion,
      fabric,
      description,
      stock: Number(stock),
      sizes: sizes
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      colors: initial?.colors ?? [{ name: "Maroon", hex: "#6b1f2a" }],
      images:
        images.length > 0
          ? images
          : [
              "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&q=80",
            ],
      collection: initial?.collection ?? ["Handmade Kurti"],
      rating: initial?.rating ?? 4.5,
      reviewCount: initial?.reviewCount ?? 0,
      createdAt: initial?.createdAt ?? new Date().toISOString(),
      isNew,
      isBestSeller: isBest,
      featured,
      status,
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-3 mt-4 text-sm">
      <div>
        <label className="text-xs text-muted-foreground">Product name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Slug</label>
        <input
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="auto-generated"
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Price</label>
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Discount price</label>
        <input
          type="number"
          value={discountPrice}
          onChange={(e) => setDiscountPrice(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Category</label>
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Occasion</label>
        <select
          value={occasion}
          onChange={(e) => setOccasion(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option>Everyday</option>
          <option>Festive</option>
          <option>Formal</option>
        </select>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Fabric</label>
        <input
          value={fabric}
          onChange={(e) => setFabric(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Stock</label>
        <input
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Status</label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "Published" | "Draft" | "Archived")}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary text-sm"
        >
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
          <option value="Archived">Archived</option>
        </select>
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-muted-foreground">Description</label>
        <textarea
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-muted-foreground">Sizes (comma separated)</label>
        <input
          value={sizes}
          onChange={(e) => setSizes(e.target.value)}
          placeholder="S, M, L, XL"
          className="mt-1 w-full px-3 py-2 rounded-lg bg-secondary"
        />
      </div>

      <div className="md:col-span-2 mt-2">
        <label className="text-xs text-muted-foreground mb-1 block">Product Images (up to 4)</label>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {images.map((url, i) => (
            <div
              key={i}
              className="relative h-24 w-20 shrink-0 rounded-lg overflow-hidden border border-border group"
            >
              <img src={url} className="h-full w-full object-cover" alt="Product upload" />
              <button
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500/90 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
          {images.length < 4 && (
            <label className="h-24 w-20 shrink-0 rounded-lg border-2 border-dashed border-border bg-secondary flex flex-col items-center justify-center cursor-pointer hover:bg-border/30 transition text-muted-foreground">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <UploadCloud className="h-5 w-5" />
              )}
              <span className="text-[10px] mt-1 font-medium">{uploading ? "..." : "Upload"}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
          )}
        </div>
      </div>
      <div className="md:col-span-2 flex gap-4 text-sm">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="accent-maroon"
          />{" "}
          Featured
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isNew}
            onChange={(e) => setIsNew(e.target.checked)}
            className="accent-maroon"
          />{" "}
          New Arrival
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isBest}
            onChange={(e) => setIsBest(e.target.checked)}
            className="accent-maroon"
          />{" "}
          Best Seller
        </label>
      </div>
      <div className="md:col-span-2 flex justify-end gap-2 pt-3">
        <DialogClose className="px-4 py-2 rounded-lg border border-border text-sm">
          Cancel
        </DialogClose>
        <button
          onClick={submit}
          className="px-5 py-2 rounded-lg bg-maroon text-primary-foreground text-sm font-semibold"
        >
          {initial ? "Save Changes" : "Publish"}
        </button>
      </div>
    </div>
  );
}

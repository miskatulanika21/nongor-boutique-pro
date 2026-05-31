import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, TableShell, StatusPill } from "@/components/admin/ui";
import { useAdmin, type Coupon } from "@/store/admin";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons & Offers — Admin" }] }),
  component: Page,
});

function Page() {
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = useAdmin();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Form State
  const [code, setCode] = useState("");
  const [type, setType] = useState("Percentage");
  const [value, setValue] = useState(10);
  const [minOrder, setMinOrder] = useState(1000);
  const [expiry, setExpiry] = useState("2026-12-31");
  const [active, setActive] = useState(true);

  const openNewModal = () => {
    setEditingCoupon(null);
    setCode("");
    setType("Percentage");
    setValue(10);
    setMinOrder(1000);
    setExpiry("2026-12-31");
    setActive(true);
    setModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setType(c.type);
    setValue(c.value);
    setMinOrder(c.minOrder);
    setExpiry(c.expiry);
    setActive(c.active);
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Coupon code is required");
      return;
    }

    const cData: Coupon = {
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      minOrder: Number(minOrder),
      expiry,
      uses: editingCoupon ? editingCoupon.uses : 0,
      active,
    };

    if (editingCoupon) {
      updateCoupon(editingCoupon.code, cData);
      toast.success(`Coupon ${cData.code} updated successfully!`);
    } else {
      // Check for duplicates
      if (coupons.some((c) => c.code === cData.code)) {
        toast.error(`Coupon code ${cData.code} already exists!`);
        return;
      }
      addCoupon(cData);
      toast.success(`Coupon ${cData.code} created successfully!`);
    }
    setModalOpen(false);
  };

  const handleDelete = (couponCode: string) => {
    const ok = window.confirm(`Are you sure you want to delete coupon ${couponCode}?`);
    if (ok) {
      deleteCoupon(couponCode);
      toast.success(`Coupon ${couponCode} deleted.`);
    }
  };

  return (
    <div className="relative">
      <PageHeader
        title="Coupons & Offers"
        subtitle={`${coupons.length} coupons managed`}
        actions={
          <button
            onClick={openNewModal}
            className="bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-lg px-4 py-2 text-sm font-semibold flex items-center gap-1 cursor-pointer transition shadow-soft"
          >
            <Plus className="h-4 w-4" /> New Coupon
          </button>
        }
      />
      <TableShell>
        <table className="w-full text-sm min-w-[700px]">
          <thead className="bg-secondary/50 text-xs text-muted-foreground">
            <tr>
              <th className="text-left p-3">Code</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Value</th>
              <th className="text-left p-3">Min Order</th>
              <th className="text-left p-3">Expiry</th>
              <th className="text-left p-3">Uses Count</th>
              <th className="text-left p-3">Status</th>
              <th className="text-right p-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.code} className="border-t border-border/40">
                <td className="p-3 font-mono text-maroon font-semibold">{c.code}</td>
                <td className="p-3">{c.type}</td>
                <td className="p-3 font-medium">
                  {c.type === "Percentage" ? `${c.value}%` : `৳${c.value}`}
                </td>
                <td className="p-3">৳{c.minOrder}</td>
                <td className="p-3 text-xs">{c.expiry}</td>
                <td className="p-3">{c.uses}</td>
                <td className="p-3">
                  <StatusPill status={c.active ? "Active" : "Archived"} />
                </td>
                <td className="p-3 text-right whitespace-nowrap">
                  <button
                    onClick={() => openEditModal(c)}
                    className="p-1.5 hover:bg-cream rounded text-muted-foreground hover:text-maroon transition cursor-pointer inline-block"
                    title="Edit Coupon"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(c.code)}
                    className="p-1.5 hover:bg-red-50 rounded text-muted-foreground hover:text-destructive transition cursor-pointer inline-block ml-1"
                    title="Delete Coupon"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={8} className="p-8 text-center text-muted-foreground">
                  No coupons found. Click "New Coupon" to add one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </TableShell>

      {/* Coupon Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          />
          <div className="bg-ivory rounded-2xl shadow-elegant w-full max-w-md p-6 relative z-10 border border-gold/20 animate-fade-up">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="font-display text-xl text-maroon font-semibold mb-4">
              {editingCoupon ? `Edit Coupon: ${editingCoupon.code}` : "Create New Coupon"}
            </h3>
            <form onSubmit={handleSave} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                  Coupon Code
                </label>
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. FESTIVE20"
                  disabled={!!editingCoupon}
                  className="w-full px-3 py-2 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none uppercase font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Discount Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none cursor-pointer"
                  >
                    <option value="Percentage">Percentage (%)</option>
                    <option value="Flat">Flat (৳)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Discount Value
                  </label>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => setValue(Number(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Min Order Limit (৳)
                  </label>
                  <input
                    type="number"
                    value={minOrder}
                    onChange={(e) => setMinOrder(Number(e.target.value))}
                    min="0"
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                    Expiry Date
                  </label>
                  <input
                    type="date"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-secondary border border-transparent focus:border-maroon outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/60">
                <div>
                  <div className="font-semibold text-xs">Activate Coupon</div>
                  <div className="text-[10px] text-muted-foreground">
                    Is this coupon active currently?
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="accent-maroon h-4 w-4 cursor-pointer"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-maroon hover:bg-maroon-deep text-primary-foreground rounded-lg py-2 text-sm font-semibold cursor-pointer transition"
                >
                  Save Coupon
                </button>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-border rounded-lg text-sm cursor-pointer hover:bg-cream transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

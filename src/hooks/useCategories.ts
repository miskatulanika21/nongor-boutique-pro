import { useState, useEffect } from "react";
import { getActiveCategories, adminGetAllCategories } from "@/services/categories";
import { categories as mockCategories } from "@/data/mock";

export type Category = {
  id: string;
  name: string;
  image: string;
  count: number;
  status: "Active" | "Coming Soon";
};

export function useActiveCategories() {
  const [categories, setCategories] = useState<Category[]>(
    () => mockCategories.filter((c) => c.status === "Active") as Category[],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    getActiveCategories()
      .then((data) => {
        if (mounted && data.length > 0) {
          setCategories(
            data.map((c) => ({
              id: c.id,
              name: c.name,
              image:
                c.image_url ||
                "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&h=600&q=80",
              count: 0, // In dynamic mode, products fetch maps categories
              status: c.is_active ? "Active" : "Coming Soon",
            })),
          );
        }
      })
      .catch((err) => {
        if (mounted) setError(err.message || "Failed to load categories");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  return { categories, loading, error };
}

export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>(() => mockCategories as Category[]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = () => {
    setLoading(true);
    adminGetAllCategories()
      .then((data) => {
        if (data.length > 0) {
          setCategories(
            data.map((c) => ({
              id: c.id,
              name: c.name,
              image:
                c.image_url ||
                "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=600&h=600&q=80",
              count: 0,
              status: c.is_active ? "Active" : "Coming Soon",
            })),
          );
        }
      })
      .catch((err) => setError(err.message || "Failed to load categories"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return { categories, loading, error, refetch: fetchCategories };
}

import { useState, useEffect } from "react";
import {
  getAllReviews,
  approveReview as dbApproveReview,
  deleteReview as dbDeleteReview,
  type Review,
} from "@/services/reviews";
import { toast } from "sonner";

export function useReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = () => {
    setLoading(true);
    getAllReviews()
      .then((data) => setReviews(data))
      .catch((err) => setError(err.message || "Failed to fetch reviews"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const approve = async (id: string) => {
    const success = await dbApproveReview(id);
    if (success) {
      setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
      toast.success("Review approved");
    } else {
      toast.error("Failed to approve review");
    }
  };

  const remove = async (id: string) => {
    const success = await dbDeleteReview(id);
    if (success) {
      setReviews((prev) => prev.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } else {
      toast.error("Failed to delete review");
    }
  };

  return { reviews, loading, error, approve, deleteReview: remove, refetch: fetchReviews };
}

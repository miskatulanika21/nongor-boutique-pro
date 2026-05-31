import { useState, useEffect } from "react";
import { getAllCustomers, type Customer } from "@/services/customers";

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = () => {
    setLoading(true);
    getAllCustomers()
      .then((data) => setCustomers(data))
      .catch((err) => setError(err.message || "Failed to fetch customers"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  return { customers, loading, error, refetch: fetchCustomers };
}

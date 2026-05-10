// Dashboard hooks — wired to the real backend API.

import { useEffect, useState, useCallback } from "react";

const API = process.env.REACT_APP_BACKEND_URL;

// Quick actions are static UI config — no backend needed.
const QUICK_ACTIONS = [
  { id: "add-drug", label: "Add Drug", icon: "PlusCircle", color: "green" },
  { id: "add-patient", label: "Add Patient", icon: "UserPlus", color: "blue" },
  { id: "add-doctor", label: "Add Doctor", icon: "Stethoscope", color: "purple" },
  { id: "new-rx", label: "New Prescription", icon: "FileText", color: "orange" },
];

function useFetch(path) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}${path}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setData(await res.json());
      setError(null);
    } catch (e) { setError(e); }
    finally { setIsLoading(false); }
  }, [path]);

  useEffect(() => { refetch(); }, [refetch]);
  return { data, isLoading, error, refetch };
}

export const useStats = () => {
  const { data, isLoading, error } = useFetch("/api/dashboard/stats");
  return { data: data || [], isLoading, error };
};

export const useRecentPrescriptions = () => {
  const { data, isLoading, error } = useFetch("/api/dashboard/recent-prescriptions?limit=5");
  return { data: data || [], isLoading, error };
};

export const useLowStock = () => {
  const { data, isLoading, error } = useFetch("/api/dashboard/low-stock?limit=5");
  return { data: data || [], isLoading, error };
};

export const useQuickActions = () => ({ data: QUICK_ACTIONS, isLoading: false, error: null });

export const useInventoryOverview = () => {
  const { data, isLoading, error } = useFetch("/api/dashboard/inventory-overview");
  return { data: data || { total: 0, inStock: 0, lowStock: 0, outOfStock: 0 }, isLoading, error };
};

export const useSystemSummary = () => {
  const { data, isLoading, error } = useFetch("/api/dashboard/system-summary");
  return { data: data || [], isLoading, error };
};

export const useNotifications = () => {
  const { data, isLoading, error } = useFetch("/api/dashboard/notifications");
  return { data: data || [], isLoading, error };
};

export const useCurrentUser = () => {
  const { data, isLoading, error } = useFetch("/api/me");
  return { data: data || { name: "Admin", role: "Admin", initials: "AU", email: "" }, isLoading, error };
};

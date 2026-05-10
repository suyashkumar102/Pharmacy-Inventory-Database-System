// Drugs domain hook — wired to real MySQL backend via /api/drugs/*.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DRUG_CATEGORIES,
  deriveStatus,
} from "../lib/mockDrugs";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export const useDrugs = () => {
  const [drugs, setDrugs] = useState([]);
  const [series, setSeries] = useState({ total: [], inStock: [], lowStock: [], outOfStock: [], value: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listRes, seriesRes] = await Promise.all([
        fetch(`${API}/drugs`),
        fetch(`${API}/drugs/kpi-series`),
      ]);
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
      setDrugs(await listRes.json());
      setSeries(await seriesRes.json());
      setError(null);
    } catch (e) { setError(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addDrug = useCallback(async (drug) => {
    await fetch(`${API}/drugs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(drug),
    });
    await fetchAll();
  }, [fetchAll]);

  const updateDrug = useCallback(async (id, patch) => {
    await fetch(`${API}/drugs/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await fetchAll();
  }, [fetchAll]);

  const deleteDrug = useCallback(async (id) => {
    await fetch(`${API}/drugs/${id}`, { method: 'DELETE' });
    await fetchAll();
  }, [fetchAll]);

  const enriched = useMemo(
    () =>
      drugs.map((d) => {
        const cat = DRUG_CATEGORIES.find((c) => c.id === d.categoryId);
        return {
          ...d,
          category: cat?.label ?? "Other",
          categoryColor: cat?.color ?? "slate",
          status: deriveStatus(d.stock),
        };
      }),
    [drugs]
  );

  const kpis = useMemo(() => {
    const total = enriched.length;
    const inStock = enriched.filter((d) => d.status === "in_stock").length;
    const lowStock = enriched.filter((d) => d.status === "low_stock").length;
    const outOfStock = enriched.filter((d) => d.status === "out_of_stock").length;
    const value = enriched.reduce((sum, d) => sum + d.price * d.stock, 0);
    return { total, inStock, lowStock, outOfStock, value };
  }, [enriched]);

  return {
    data: enriched,
    kpis,
    series,
    addDrug,
    updateDrug,
    deleteDrug,
    isLoading,
    error,
  };
};

export const useDrugCategories = () => ({ data: DRUG_CATEGORIES });

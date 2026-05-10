// Doctors domain hook — wired to real MySQL backend via /api/doctors/*.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  SPECIALIZATIONS,
  DOCTOR_STATUSES,
  avatarColorFor,
  initialsOf,
} from "../lib/mockDoctors";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const isThisMonth = (iso) => {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
};

export const useDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [series, setSeries] = useState({ total: [], specializations: [], active: [], thisMonth: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listRes, seriesRes] = await Promise.all([
        fetch(`${API}/doctors`),
        fetch(`${API}/doctors/kpi-series`),
      ]);
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
      setDoctors(await listRes.json());
      setSeries(await seriesRes.json());
      setError(null);
    } catch (e) { setError(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addDoctor = useCallback(async (d) => {
    await fetch(`${API}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(d),
    });
    await fetchAll();
  }, [fetchAll]);

  const updateDoctor = useCallback(async (id, patch) => {
    await fetch(`${API}/doctors/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await fetchAll();
  }, [fetchAll]);

  const deleteDoctor = useCallback(async (id) => {
    await fetch(`${API}/doctors/${id}`, { method: 'DELETE' });
    await fetchAll();
  }, [fetchAll]);

  const enriched = useMemo(
    () =>
      doctors.map((d) => {
        const spec = SPECIALIZATIONS.find((s) => s.id === d.specializationId);
        return {
          ...d,
          specialization: spec?.label ?? "Other",
          specializationColor: spec?.color ?? "slate",
          initials: initialsOf(d.name.replace(/^Dr\.?\s+/i, "")),
          avatarColor: avatarColorFor(d.name),
        };
      }),
    [doctors]
  );

  const kpis = useMemo(() => {
    const total = enriched.length;
    const specSet = new Set(enriched.map((d) => d.specializationId));
    const active = enriched.filter((d) => d.status === "active").length;
    const thisMonth = enriched.filter((d) => isThisMonth(d.addedAt)).length;
    return { total, specializations: specSet.size, active, thisMonth };
  }, [enriched]);

  return {
    data: enriched,
    kpis,
    series,
    addDoctor,
    updateDoctor,
    deleteDoctor,
    isLoading,
    error,
  };
};

export const useSpecializations = () => ({ data: SPECIALIZATIONS });
export const useDoctorStatuses = () => ({ data: DOCTOR_STATUSES });

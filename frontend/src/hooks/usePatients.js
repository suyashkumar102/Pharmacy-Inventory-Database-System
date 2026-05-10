// Patients domain hook — wired to real MySQL backend via /api/patients/*.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PATIENT_STATUSES,
  PATIENT_GENDERS,
  avatarColorFor,
  initialsOf,
} from "../lib/mockPatients";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const isThisMonth = (iso) => {
  const d = new Date(iso);
  const n = new Date();
  return d.getFullYear() === n.getFullYear() && d.getMonth() === n.getMonth();
};

export const usePatients = () => {
  const [patients, setPatients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/patients`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setPatients(await res.json());
      setError(null);
    } catch (e) { setError(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addPatient = useCallback(async (p) => {
    await fetch(`${API}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(p),
    });
    await fetchAll();
  }, [fetchAll]);

  const updatePatient = useCallback(async (id, patch) => {
    await fetch(`${API}/patients/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    await fetchAll();
  }, [fetchAll]);

  const deletePatient = useCallback(async (id) => {
    await fetch(`${API}/patients/${id}`, { method: 'DELETE' });
    await fetchAll();
  }, [fetchAll]);

  const enriched = useMemo(
    () =>
      patients.map((p) => ({
        ...p,
        initials: initialsOf(p.name),
        avatarColor: avatarColorFor(p.name),
      })),
    [patients]
  );

  const kpis = useMemo(() => {
    const total = enriched.length;
    const addedThisMonth = enriched.filter((p) => isThisMonth(p.registeredAt)).length;
    const active = enriched.filter((p) => p.status === "active").length;
    const sortedByDate = [...enriched].sort(
      (a, b) => new Date(b.registeredAt) - new Date(a.registeredAt)
    );
    const lastAdded = sortedByDate[0] ?? null;
    return { total, addedThisMonth, active, lastAdded };
  }, [enriched]);

  const locations = useMemo(() => {
    const set = new Map();
    enriched.forEach((p) => set.set(p.city, p.state));
    return Array.from(set.entries()).map(([city, state]) => ({ city, state }));
  }, [enriched]);

  return {
    data: enriched,
    kpis,
    locations,
    addPatient,
    updatePatient,
    deletePatient,
    isLoading,
    error,
  };
};

export const usePatientStatuses = () => ({ data: PATIENT_STATUSES });
export const usePatientGenders = () => ({ data: PATIENT_GENDERS });

// Prescriptions domain hook — wired to real MySQL backend via /api/prescriptions/*.

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  PRESCRIPTION_STATUSES,
} from "../lib/mockPrescriptions";
import { initialsOf, avatarColorFor } from "../lib/mockPatients";
import { SPECIALIZATIONS } from "../lib/mockDoctors";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SPEC_LOOKUP = Object.fromEntries(SPECIALIZATIONS.map((s) => [s.id, s]));

export const usePrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [series, setSeries] = useState({ total: [], pending: [], completed: [], cancelled: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [listRes, seriesRes] = await Promise.all([
        fetch(`${API}/prescriptions`),
        fetch(`${API}/prescriptions/kpi-series`),
      ]);
      if (!listRes.ok) throw new Error(`HTTP ${listRes.status}`);
      setPrescriptions(await listRes.json());
      setSeries(await seriesRes.json());
      setError(null);
    } catch (e) { setError(e); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addPrescription = useCallback(async (rx) => {
    await fetch(`${API}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rx),
    });
    await fetchAll();
  }, [fetchAll]);

  const updatePrescriptionStatus = useCallback(async (id, status) => {
    await fetch(`${API}/prescriptions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    await fetchAll();
  }, [fetchAll]);

  // Enrich data that comes from the server (add initials, avatar colors, specialization labels)
  const enriched = useMemo(() =>
    prescriptions.map((rx) => ({
      ...rx,
      patient: rx.patient ? {
        ...rx.patient,
        initials: initialsOf(rx.patient.name || ''),
        avatarColor: avatarColorFor(rx.patient.name || ''),
      } : null,
      doctor: rx.doctor ? {
        ...rx.doctor,
        specialization: SPEC_LOOKUP[rx.doctor.specializationId]?.label ?? "",
      } : null,
    })),
    [prescriptions]
  );

  const kpis = useMemo(() => {
    const total = enriched.length;
    const pending = enriched.filter((r) => r.status === "pending").length;
    const completed = enriched.filter((r) => r.status === "completed").length;
    const cancelled = enriched.filter((r) => r.status === "cancelled").length;
    return { total, pending, completed, cancelled };
  }, [enriched]);

  return {
    data: enriched,
    kpis,
    series,
    addPrescription,
    updatePrescriptionStatus,
    isLoading,
    error,
  };
};

export const usePrescriptionStatuses = () => ({ data: PRESCRIPTION_STATUSES });

// Return all patients for the prescription form dropdown
export const useRxPatients = () => {
  const [data, setData] = useState([]);
  useEffect(() => {
    fetch(`${API}/patients`)
      .then(r => r.json())
      .then(patients => {
        setData(patients.map(p => ({
          ...p,
          initials: initialsOf(p.name || ''),
          avatarColor: avatarColorFor(p.name || ''),
        })));
      })
      .catch(() => setData([]));
  }, []);
  return { data };
};

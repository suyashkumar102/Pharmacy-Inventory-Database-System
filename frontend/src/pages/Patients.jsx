import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "../components/ui/card";
import { PatientsHeader } from "../components/patients/PatientsHeader";
import { PatientsKPIs } from "../components/patients/PatientsKPIs";
import { PatientsToolbar } from "../components/patients/PatientsToolbar";
import { PatientsTable } from "../components/patients/PatientsTable";
import { DrugsPagination } from "../components/drugs/DrugsPagination";
import { PatientFormDialog } from "../components/patients/PatientFormDialog";
import { DeletePatientDialog } from "../components/patients/DeletePatientDialog";
import { PatientDetailDialog } from "../components/patients/PatientDetailDialog";
import { usePatients } from "../hooks/usePatients";

const PAGE_SIZE = 10;

export default function PatientsPage() {
  const { data: patients, kpis, locations, addPatient, updatePatient, deletePatient } = usePatients();

  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("registeredAt_desc");
  const [view, setView] = useState("list");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(decodeURIComponent(q));
  }, [searchParams]);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const filteredSorted = useMemo(() => {
    let list = patients;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.phone.includes(q) ||
          p.email.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q)
      );
    }
    if (location !== "all") list = list.filter((p) => p.city === location);
    if (status !== "all") list = list.filter((p) => p.status === status);

    const [field, dir] = sort.split("_");
    list = [...list].sort((a, b) => {
      let av = a[field];
      let bv = b[field];
      if (field === "registeredAt") {
        av = new Date(av).getTime();
        bv = new Date(bv).getTime();
      } else if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [patients, search, location, status, sort]);

  const total = filteredSorted.length;
  const pageItems = useMemo(
    () => filteredSorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredSorted, page]
  );

  const handleSort = (field) => {
    setSort((curr) => {
      const [f, d] = curr.split("_");
      if (f === field) return `${field}_${d === "asc" ? "desc" : "asc"}`;
      return `${field}_asc`;
    });
  };

  const handleSubmit = (payload) => {
    if (editTarget) {
      updatePatient(editTarget.id, payload);
      toast.success("Patient updated", { description: payload.name });
    } else {
      addPatient(payload);
      toast.success("Patient added", { description: payload.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deletePatient(deleteTarget.id);
      toast.success("Patient deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
    }
  };

  return (
    <div data-testid="patients-page" className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <PatientsHeader onAddPatient={() => { setEditTarget(null); setFormOpen(true); }} />
      <PatientsKPIs kpis={kpis} />

      <Card className="border-border/60 bg-card/40 p-5 backdrop-blur md:p-6">
        <PatientsToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          location={location}
          onLocationChange={(v) => { setLocation(v); setPage(1); }}
          status={status}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          view={view}
          onViewChange={setView}
          locations={locations}
        />

        <div className="mt-5">
          <PatientsTable
            patients={pageItems}
            sort={sort}
            onSort={handleSort}
            onView={(p) => setViewTarget(p)}
            onEdit={(p) => { setEditTarget(p); setFormOpen(true); }}
            onDelete={(p) => setDeleteTarget(p)}
          />
        </div>

        <div className="mt-5">
          <DrugsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </div>
      </Card>

      <PatientFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        patient={editTarget}
        onSubmit={handleSubmit}
      />
      <DeletePatientDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        patient={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
      <PatientDetailDialog
        open={Boolean(viewTarget)}
        onOpenChange={(v) => !v && setViewTarget(null)}
        patient={viewTarget}
      />
    </div>
  );
}

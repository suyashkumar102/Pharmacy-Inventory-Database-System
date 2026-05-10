import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "../components/ui/card";
import { DoctorsHeader } from "../components/doctors/DoctorsHeader";
import { DoctorsKPIs } from "../components/doctors/DoctorsKPIs";
import { DoctorsToolbar } from "../components/doctors/DoctorsToolbar";
import { DoctorsTable } from "../components/doctors/DoctorsTable";
import { DrugsPagination } from "../components/drugs/DrugsPagination";
import { DoctorFormDialog } from "../components/doctors/DoctorFormDialog";
import { DeleteDoctorDialog } from "../components/doctors/DeleteDoctorDialog";
import { DoctorDetailDialog } from "../components/doctors/DoctorDetailDialog";
import { useDoctors } from "../hooks/useDoctors";

const PAGE_SIZE = 10;

export default function DoctorsPage() {
  const { data: doctors, kpis, series, addDoctor, updateDoctor, deleteDoctor } = useDoctors();

  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [specialization, setSpecialization] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name_asc");
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
    let list = doctors;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          d.qualification.toLowerCase().includes(q) ||
          d.email.toLowerCase().includes(q)
      );
    }
    if (specialization !== "all") list = list.filter((d) => d.specializationId === specialization);
    if (status !== "all") list = list.filter((d) => d.status === status);

    const [field, dir] = sort.split("_");
    list = [...list].sort((a, b) => {
      let av = a[field];
      let bv = b[field];
      if (typeof av === "string") {
        av = av.toLowerCase();
        bv = bv.toLowerCase();
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [doctors, search, specialization, status, sort]);

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
      updateDoctor(editTarget.id, payload);
      toast.success("Doctor updated", { description: payload.name });
    } else {
      addDoctor(payload);
      toast.success("Doctor added", { description: payload.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteDoctor(deleteTarget.id);
      toast.success("Doctor removed", { description: deleteTarget.name });
      setDeleteTarget(null);
    }
  };

  return (
    <div data-testid="doctors-page" className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <DoctorsHeader onAddDoctor={() => { setEditTarget(null); setFormOpen(true); }} />
      <DoctorsKPIs kpis={kpis} series={series} />

      <Card className="border-border/60 bg-card/40 p-5 backdrop-blur md:p-6">
        <DoctorsToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          specialization={specialization}
          onSpecializationChange={(v) => { setSpecialization(v); setPage(1); }}
          status={status}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          view={view}
          onViewChange={setView}
        />

        <div className="mt-5">
          <DoctorsTable
            doctors={pageItems}
            sort={sort}
            onSort={handleSort}
            onView={(d) => setViewTarget(d)}
            onEdit={(d) => { setEditTarget(d); setFormOpen(true); }}
            onDelete={(d) => setDeleteTarget(d)}
          />
        </div>

        <div className="mt-5">
          <DrugsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </div>
      </Card>

      <DoctorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        doctor={editTarget}
        onSubmit={handleSubmit}
      />
      <DeleteDoctorDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        doctor={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
      <DoctorDetailDialog
        open={Boolean(viewTarget)}
        onOpenChange={(v) => !v && setViewTarget(null)}
        doctor={viewTarget}
      />
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "../components/ui/card";
import { PrescriptionsHeader } from "../components/prescriptions/PrescriptionsHeader";
import { PrescriptionsKPIs } from "../components/prescriptions/PrescriptionsKPIs";
import { PrescriptionsToolbar } from "../components/prescriptions/PrescriptionsToolbar";
import { PrescriptionsTable } from "../components/prescriptions/PrescriptionsTable";
import { DrugsPagination } from "../components/drugs/DrugsPagination";
import { PrescriptionFormDialog } from "../components/prescriptions/PrescriptionFormDialog";
import { PrescriptionDetailDialog } from "../components/prescriptions/PrescriptionDetailDialog";
import { usePrescriptions } from "../hooks/usePrescriptions";

const PAGE_SIZE = 4;

export default function PrescriptionsPage() {
  const { data: prescriptions, kpis, series, addPrescription } = usePrescriptions();

  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
  const [sort, setSort] = useState("issuedAt_desc");
  const [view, setView] = useState("table");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(decodeURIComponent(q));
  }, [searchParams]);

  const [formOpen, setFormOpen] = useState(false);
  const [viewTarget, setViewTarget] = useState(null);

  const filteredSorted = useMemo(() => {
    let list = prescriptions;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (rx) =>
          rx.id.toLowerCase().includes(q) ||
          (rx.patient?.name ?? "").toLowerCase().includes(q) ||
          (rx.doctor?.name ?? "").toLowerCase().includes(q) ||
          (rx.patient?.phone ?? "").includes(q)
      );
    }
    if (status !== "all") list = list.filter((rx) => rx.status === status);
    if (dateRange.from) {
      const from = new Date(dateRange.from).setHours(0, 0, 0, 0);
      list = list.filter((rx) => new Date(rx.issuedAt).getTime() >= from);
    }
    if (dateRange.to) {
      const to = new Date(dateRange.to).setHours(23, 59, 59, 999);
      list = list.filter((rx) => new Date(rx.issuedAt).getTime() <= to);
    }

    const [field, dir] = sort.split("_");
    list = [...list].sort((a, b) => {
      let av;
      let bv;
      if (field === "issuedAt") {
        av = new Date(a.issuedAt).getTime();
        bv = new Date(b.issuedAt).getTime();
      } else if (field === "patientName") {
        av = (a.patient?.name ?? "").toLowerCase();
        bv = (b.patient?.name ?? "").toLowerCase();
      } else if (field === "doctorName") {
        av = (a.doctor?.name ?? "").toLowerCase();
        bv = (b.doctor?.name ?? "").toLowerCase();
      } else if (field === "medicineCount") {
        av = a.medicines.length;
        bv = b.medicines.length;
      } else {
        av = a[field];
        bv = b[field];
        if (typeof av === "string") {
          av = av.toLowerCase();
          bv = bv.toLowerCase();
        }
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return list;
  }, [prescriptions, search, status, dateRange, sort]);

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

  const handleDownload = (rx) => {
    toast.success("Prescription download started", {
      description: `#${rx.id} · ${rx.patient?.name ?? ""}`,
    });
  };

  const handleSubmit = (payload) => {
    addPrescription(payload);
    toast.success("Prescription issued", { description: `New prescription created` });
  };

  return (
    <div data-testid="prescriptions-page" className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <PrescriptionsHeader onNew={() => setFormOpen(true)} />
      <PrescriptionsKPIs kpis={kpis} series={series} />

      <Card className="border-border/60 bg-card/40 p-5 backdrop-blur md:p-6">
        <PrescriptionsToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          status={status}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          startDate={dateRange.from}
          endDate={dateRange.to}
          onDateRangeChange={(r) => { setDateRange(r); setPage(1); }}
          view={view}
          onViewChange={setView}
        />

        <div className="mt-5">
          <PrescriptionsTable
            prescriptions={pageItems}
            sort={sort}
            onSort={handleSort}
            onView={(rx) => setViewTarget(rx)}
            onDownload={handleDownload}
          />
        </div>

        <div className="mt-5">
          <DrugsPagination page={page} pageSize={PAGE_SIZE} total={total} onPageChange={setPage} />
        </div>
      </Card>

      <PrescriptionFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleSubmit}
      />
      <PrescriptionDetailDialog
        open={Boolean(viewTarget)}
        onOpenChange={(v) => !v && setViewTarget(null)}
        prescription={viewTarget}
        onDownload={handleDownload}
      />
    </div>
  );
}

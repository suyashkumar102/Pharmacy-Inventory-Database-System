import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Card } from "../components/ui/card";
import { DrugsHeader } from "../components/drugs/DrugsHeader";
import { DrugsKPIs } from "../components/drugs/DrugsKPIs";
import { DrugsToolbar } from "../components/drugs/DrugsToolbar";
import { DrugsTable } from "../components/drugs/DrugsTable";
import { DrugsPagination } from "../components/drugs/DrugsPagination";
import { DrugFormDialog } from "../components/drugs/DrugFormDialog";
import { DeleteDrugDialog } from "../components/drugs/DeleteDrugDialog";
import { useDrugs } from "../hooks/useDrugs";

const PAGE_SIZE = 10;

export default function DrugsPage() {
  const { data: drugs, kpis, series, addDrug, updateDrug, deleteDrug } = useDrugs();
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("name_asc");
  const [view, setView] = useState("grid");
  const [page, setPage] = useState(1);

  // Pre-fill search from ?q= and status filter from ?status= URL params
  useEffect(() => {
    const q = searchParams.get("q");
    const s = searchParams.get("status");
    if (q) setSearch(decodeURIComponent(q));
    if (s) setStatus(s);
  }, [searchParams]);

  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filteredSorted = useMemo(() => {
    let list = drugs;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (d) => d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q)
      );
    }
    if (category !== "all") list = list.filter((d) => d.categoryId === category);
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
  }, [drugs, search, category, status, sort]);

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

  const handleAddClick = () => {
    setEditTarget(null);
    setFormOpen(true);
  };

  const handleEdit = (drug) => {
    setEditTarget(drug);
    setFormOpen(true);
  };

  const handleSubmitForm = (payload) => {
    if (editTarget) {
      updateDrug(editTarget.id, payload);
      toast.success("Drug updated", { description: payload.name });
    } else {
      addDrug(payload);
      toast.success("Drug added", { description: payload.name });
    }
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteDrug(deleteTarget.id);
      toast.success("Drug deleted", { description: deleteTarget.name });
      setDeleteTarget(null);
    }
  };

  return (
    <div data-testid="drugs-page" className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <DrugsHeader onAddDrug={handleAddClick} />
      <DrugsKPIs kpis={kpis} series={series} />

      <Card className="border-border/60 bg-card/40 p-5 backdrop-blur md:p-6">
        <DrugsToolbar
          search={search}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          category={category}
          onCategoryChange={(v) => { setCategory(v); setPage(1); }}
          status={status}
          onStatusChange={(v) => { setStatus(v); setPage(1); }}
          sort={sort}
          onSortChange={setSort}
          view={view}
          onViewChange={setView}
        />

        <div className="mt-5">
          <DrugsTable
            drugs={pageItems}
            sort={sort}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={(d) => setDeleteTarget(d)}
          />
        </div>

        <div className="mt-5">
          <DrugsPagination
            page={page}
            pageSize={PAGE_SIZE}
            total={total}
            onPageChange={setPage}
          />
        </div>
      </Card>

      <DrugFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        drug={editTarget}
        onSubmit={handleSubmitForm}
      />
      <DeleteDrugDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(v) => !v && setDeleteTarget(null)}
        drug={deleteTarget}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

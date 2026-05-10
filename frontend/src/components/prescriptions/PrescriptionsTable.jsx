import { ChevronsUpDown, Eye, Download, Calendar } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

const AVATAR_BG = {
  blue: "bg-chart-blue/20 text-chart-blue ring-chart-blue/30",
  green: "bg-chart-green/20 text-chart-green ring-chart-green/30",
  purple: "bg-chart-purple/20 text-chart-purple ring-chart-purple/30",
  orange: "bg-chart-orange/20 text-chart-orange ring-chart-orange/30",
  pink: "bg-pink-500/20 text-pink-400 ring-pink-500/30",
  cyan: "bg-cyan-500/20 text-cyan-400 ring-cyan-500/30",
  amber: "bg-amber-500/20 text-amber-400 ring-amber-500/30",
};

const STATUS_PILL = {
  pending: "border-chart-orange/30 bg-chart-orange/10 text-chart-orange",
  completed: "border-chart-green/30 bg-chart-green/10 text-chart-green",
  cancelled: "border-chart-red/30 bg-chart-red/10 text-chart-red",
};

const STATUS_LABEL = {
  pending: "Pending",
  completed: "Completed",
  cancelled: "Cancelled",
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getFullYear()}`;
};
const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

const SortHeader = ({ label, field, sort, onSort }) => {
  const active = sort?.startsWith(field);
  return (
    <button
      onClick={() => onSort(field)}
      data-testid={`prescriptions-sort-${field}`}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground"
      )}
    >
      {label}
      <ChevronsUpDown className={cn("h-3 w-3", active && "text-primary")} />
    </button>
  );
};

export const PrescriptionsTable = ({ prescriptions, sort, onSort, onView, onDownload }) => (
  <Card data-testid="prescriptions-table" className="overflow-hidden border-border/60 bg-card/70 p-0 backdrop-blur">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/20">
            <th className="px-6 py-4 text-left">
              <SortHeader label="ID" field="id" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Patient" field="patientName" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Doctor" field="doctorName" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Date" field="issuedAt" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Status" field="status" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Medicines" field="medicineCount" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {prescriptions.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">
                No prescriptions match your filters.
              </td>
            </tr>
          ) : (
            prescriptions.map((rx) => (
              <tr
                key={rx.id}
                data-testid={`prescription-row-${rx.id}`}
                className="border-b border-border/40 last:border-0 transition-colors hover:bg-secondary/20"
              >
                <td className="px-6 py-5 align-top">
                  <span className="font-mono text-xs font-semibold text-muted-foreground">#{rx.id}</span>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1", AVATAR_BG[rx.patient?.avatarColor ?? "blue"])}>
                      {rx.patient?.initials ?? "—"}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{rx.patient?.name ?? "Unknown"}</div>
                      <div className="mt-0.5 text-xs tabular-nums text-muted-foreground">{rx.patient?.phone ?? ""}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="font-medium text-foreground">{rx.doctor?.name ?? "Unknown"}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{rx.doctor?.specialization ?? ""}</div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatDate(rx.issuedAt)}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{formatTime(rx.issuedAt)}</div>
                </td>
                <td className="px-6 py-5 align-top">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                      STATUS_PILL[rx.status]
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {STATUS_LABEL[rx.status]}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="text-sm font-medium text-foreground">
                    {rx.medicines.length} {rx.medicines.length === 1 ? "Medicine" : "Medicines"}
                  </div>
                  <button
                    onClick={() => onView(rx)}
                    data-testid={`prescription-view-details-${rx.id}`}
                    className="mt-0.5 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    View Details
                  </button>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      data-testid={`prescription-view-${rx.id}`}
                      onClick={() => onView(rx)}
                      aria-label={`View prescription ${rx.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-chart-blue/30 bg-chart-blue/10 text-chart-blue transition-all hover:-translate-y-0.5 hover:bg-chart-blue/20"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      data-testid={`prescription-download-${rx.id}`}
                      onClick={() => onDownload(rx)}
                      aria-label={`Download prescription ${rx.id}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-chart-green/30 bg-chart-green/10 text-chart-green transition-all hover:-translate-y-0.5 hover:bg-chart-green/20"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  </Card>
);

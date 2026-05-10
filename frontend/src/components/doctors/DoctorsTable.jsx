import { ChevronsUpDown, Eye, Pencil, Trash2, Phone, Mail } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
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

const SPEC_DOT = {
  red: "bg-chart-red",
  blue: "bg-chart-blue",
  pink: "bg-pink-400",
  amber: "bg-amber-400",
  purple: "bg-chart-purple",
  cyan: "bg-cyan-400",
  rose: "bg-rose-400",
  teal: "bg-teal-400",
  orange: "bg-chart-orange",
  green: "bg-chart-green",
  slate: "bg-slate-400",
};

const STATUS_PILL = {
  active: "border-chart-green/30 bg-chart-green/10 text-chart-green",
  on_leave: "border-chart-orange/30 bg-chart-orange/10 text-chart-orange",
  inactive: "border-slate-500/30 bg-slate-500/10 text-slate-400",
};

const STATUS_LABEL = {
  active: "Active",
  on_leave: "On Leave",
  inactive: "Inactive",
};

const SortHeader = ({ label, field, sort, onSort }) => {
  const active = sort?.startsWith(field);
  return (
    <button
      onClick={() => onSort(field)}
      data-testid={`doctors-sort-${field}`}
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

export const DoctorsTable = ({ doctors, sort, onSort, onView, onEdit, onDelete }) => (
  <Card data-testid="doctors-table" className="overflow-hidden border-border/60 bg-card/70 p-0 backdrop-blur">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/20">
            <th className="px-6 py-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</span>
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Doctor" field="name" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Specialization" field="specialization" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</span>
            </th>
            <th className="px-6 py-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</span>
            </th>
            <th className="px-6 py-4 text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {doctors.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-16 text-center text-sm text-muted-foreground">
                No doctors match your filters.
              </td>
            </tr>
          ) : (
            doctors.map((d) => (
              <tr
                key={d.id}
                data-testid={`doctor-row-${d.id}`}
                className="border-b border-border/40 last:border-0 transition-colors hover:bg-secondary/20"
              >
                <td className="px-6 py-5 align-top">
                  <span className="font-mono text-xs text-muted-foreground">#{d.id}</span>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1", AVATAR_BG[d.avatarColor])}>
                      {d.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{d.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground">{d.qualification}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <Badge
                    variant="outline"
                    className="rounded-full border-border/60 bg-secondary/40 px-3 py-1 text-xs font-medium text-foreground"
                  >
                    <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", SPEC_DOT[d.specializationColor])} />
                    {d.specialization}
                  </Badge>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="tabular-nums">{d.phone}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{d.email}</span>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
                      STATUS_PILL[d.status]
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {STATUS_LABEL[d.status]}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      data-testid={`doctor-view-${d.id}`}
                      onClick={() => onView(d)}
                      aria-label={`View ${d.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-chart-blue/30 bg-chart-blue/10 text-chart-blue transition-all hover:-translate-y-0.5 hover:bg-chart-blue/20"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      data-testid={`doctor-edit-${d.id}`}
                      onClick={() => onEdit(d)}
                      aria-label={`Edit ${d.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-chart-purple/30 bg-chart-purple/10 text-chart-purple transition-all hover:-translate-y-0.5 hover:bg-chart-purple/20"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      data-testid={`doctor-delete-${d.id}`}
                      onClick={() => onDelete(d)}
                      aria-label={`Delete ${d.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-chart-red/30 bg-chart-red/10 text-chart-red transition-all hover:-translate-y-0.5 hover:bg-chart-red/20"
                    >
                      <Trash2 className="h-4 w-4" />
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

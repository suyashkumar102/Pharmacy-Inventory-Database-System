import { ChevronsUpDown, Eye, Pencil, Trash2, Phone, Mail, MapPin, Calendar } from "lucide-react";
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
  active: "border-chart-green/30 bg-chart-green/10 text-chart-green",
  inactive: "border-slate-500/30 bg-slate-500/10 text-slate-400",
};

const formatDate = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()}`;
};
const formatTime = (iso) =>
  new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });

const SortHeader = ({ label, field, sort, onSort }) => {
  const active = sort?.startsWith(field);
  return (
    <button
      onClick={() => onSort(field)}
      data-testid={`patients-sort-${field}`}
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

export const PatientsTable = ({ patients, sort, onSort, onView, onEdit, onDelete }) => (
  <Card data-testid="patients-table" className="overflow-hidden border-border/60 bg-card/70 p-0 backdrop-blur">
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/60 bg-secondary/20">
            <th className="px-6 py-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</span>
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Name" field="name" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Contact</span>
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Address" field="city" sort={sort} onSort={onSort} />
            </th>
            <th className="px-6 py-4 text-left">
              <SortHeader label="Registered On" field="registeredAt" sort={sort} onSort={onSort} />
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
          {patients.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-16 text-center text-sm text-muted-foreground">
                No patients match your filters.
              </td>
            </tr>
          ) : (
            patients.map((p) => (
              <tr
                key={p.id}
                data-testid={`patient-row-${p.id}`}
                className="border-b border-border/40 last:border-0 transition-colors hover:bg-secondary/20"
              >
                <td className="px-6 py-5 align-top">
                  <span className="font-mono text-xs text-muted-foreground">#{p.id}</span>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-3">
                    <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1", AVATAR_BG[p.avatarColor])}>
                      {p.initials}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{p.name}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground capitalize">
                        {p.gender}, {p.age} yrs
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="tabular-nums">{p.phone}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <span className="truncate">{p.email}</span>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-start gap-1.5 text-sm">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <div>
                      <div className="text-foreground">{p.city},</div>
                      <div className="text-xs text-muted-foreground">{p.state}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center gap-1.5 text-sm text-foreground">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{formatDate(p.registeredAt)}</span>
                  </div>
                  <div className="mt-1.5 text-xs text-muted-foreground">{formatTime(p.registeredAt)}</div>
                </td>
                <td className="px-6 py-5 align-top">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold capitalize",
                      STATUS_PILL[p.status]
                    )}
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    {p.status}
                  </span>
                </td>
                <td className="px-6 py-5 align-top">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      data-testid={`patient-view-${p.id}`}
                      onClick={() => onView(p)}
                      aria-label={`View ${p.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-chart-blue/30 bg-chart-blue/10 text-chart-blue transition-all hover:-translate-y-0.5 hover:bg-chart-blue/20"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      data-testid={`patient-edit-${p.id}`}
                      onClick={() => onEdit(p)}
                      aria-label={`Edit ${p.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-xl border border-chart-purple/30 bg-chart-purple/10 text-chart-purple transition-all hover:-translate-y-0.5 hover:bg-chart-purple/20"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      data-testid={`patient-delete-${p.id}`}
                      onClick={() => onDelete(p)}
                      aria-label={`Delete ${p.name}`}
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

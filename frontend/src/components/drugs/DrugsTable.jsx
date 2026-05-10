import { ChevronsUpDown, Pencil, Trash2, Pill } from "lucide-react";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { cn } from "../../lib/utils";

const formatINR = (n) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(n);

const STATUS_PILL = {
  in_stock: "border-chart-green/30 bg-chart-green/10 text-chart-green",
  low_stock: "border-chart-red/30 bg-chart-red/10 text-chart-red",
  out_of_stock: "border-chart-purple/30 bg-chart-purple/10 text-chart-purple",
};

const STATUS_LABEL = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
};

const STOCK_TEXT = {
  in_stock: "text-chart-green",
  low_stock: "text-chart-red",
  out_of_stock: "text-chart-purple",
};

const CAT_DOT = {
  pink: "bg-pink-400",
  blue: "bg-chart-blue",
  green: "bg-chart-green",
  amber: "bg-amber-400",
  cyan: "bg-cyan-400",
  purple: "bg-chart-purple",
  orange: "bg-chart-orange",
  slate: "bg-slate-400",
};

const CAT_ICON_BG = {
  pink: "bg-pink-500/15 text-pink-400 ring-pink-500/25",
  blue: "bg-chart-blue/15 text-chart-blue ring-chart-blue/25",
  green: "bg-chart-green/15 text-chart-green ring-chart-green/25",
  amber: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
  cyan: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/25",
  purple: "bg-chart-purple/15 text-chart-purple ring-chart-purple/25",
  orange: "bg-chart-orange/15 text-chart-orange ring-chart-orange/25",
  slate: "bg-slate-500/15 text-slate-400 ring-slate-500/25",
};

const SortHeader = ({ label, field, sort, onSort }) => {
  const active = sort?.startsWith(field);
  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        "inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-foreground",
        active ? "text-foreground" : "text-muted-foreground"
      )}
      data-testid={`drugs-sort-${field}`}
    >
      {label}
      <ChevronsUpDown className={cn("h-3 w-3", active && "text-primary")} />
    </button>
  );
};

export const DrugsTable = ({ drugs, sort, onSort, onEdit, onDelete }) => {
  return (
    <Card data-testid="drugs-table" className="overflow-hidden border-border/60 bg-card/70 p-0 backdrop-blur">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/20">
              <th className="px-6 py-4 text-left">
                <SortHeader label="Drug Name" field="name" sort={sort} onSort={onSort} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortHeader label="Category" field="category" sort={sort} onSort={onSort} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortHeader label="Price" field="price" sort={sort} onSort={onSort} />
              </th>
              <th className="px-6 py-4 text-left">
                <SortHeader label="Stock" field="stock" sort={sort} onSort={onSort} />
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
            {drugs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-16 text-center text-sm text-muted-foreground">
                  No drugs match your filters.
                </td>
              </tr>
            ) : (
              drugs.map((d) => (
                <tr
                  key={d.id}
                  data-testid={`drug-row-${d.id}`}
                  className="border-b border-border/40 last:border-0 transition-colors hover:bg-secondary/20"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ring-1", CAT_ICON_BG[d.categoryColor])}>
                        <Pill className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{d.name}</div>
                        <div className="mt-0.5 text-xs text-muted-foreground">{d.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge
                      variant="outline"
                      className="rounded-full border-border/60 bg-secondary/40 px-3 py-1 text-xs font-medium text-foreground"
                    >
                      <span className={cn("mr-1.5 inline-block h-1.5 w-1.5 rounded-full", CAT_DOT[d.categoryColor])} />
                      {d.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-5 font-medium tabular-nums text-foreground">
                    {formatINR(d.price)}
                  </td>
                  <td className="px-6 py-5">
                    <div className={cn("text-base font-semibold tabular-nums", STOCK_TEXT[d.status])}>{d.stock}</div>
                    <div className={cn("mt-0.5 text-[11px] font-medium", STOCK_TEXT[d.status])}>
                      {STATUS_LABEL[d.status]}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <Badge
                      variant="outline"
                      className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", STATUS_PILL[d.status])}
                    >
                      {STATUS_LABEL[d.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        data-testid={`drug-edit-${d.id}`}
                        onClick={() => onEdit(d)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 bg-secondary/30 text-muted-foreground transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                        aria-label={`Edit ${d.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        data-testid={`drug-delete-${d.id}`}
                        onClick={() => onDelete(d)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-chart-red/30 bg-chart-red/10 text-chart-red transition-all hover:-translate-y-0.5 hover:bg-chart-red/20"
                        aria-label={`Delete ${d.name}`}
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
};

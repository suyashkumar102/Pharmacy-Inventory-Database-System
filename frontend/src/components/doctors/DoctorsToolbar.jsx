import { Search, Stethoscope, CircleDot, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useSpecializations } from "../../hooks/useDoctors";
import { cn } from "../../lib/utils";

export const DoctorsToolbar = ({
  search,
  onSearchChange,
  specialization,
  onSpecializationChange,
  status,
  onStatusChange,
  view,
  onViewChange,
}) => {
  const { data: specs } = useSpecializations();

  return (
    <div data-testid="doctors-toolbar" className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1 lg:max-w-xs">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          data-testid="doctors-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search doctors..."
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 pl-10 text-sm placeholder:text-muted-foreground"
        />
      </div>

      <Select value={specialization} onValueChange={onSpecializationChange}>
        <SelectTrigger
          data-testid="doctors-specialization-filter"
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm lg:w-56"
        >
          <Stethoscope className="mr-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="All Specializations" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Specializations</SelectItem>
          {specs.map((s) => (
            <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          data-testid="doctors-status-filter"
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm lg:w-44"
        >
          <CircleDot className="mr-1.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="on_leave">On Leave</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      <Button
        data-testid="doctors-filters-button"
        variant="outline"
        className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm font-medium text-foreground"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filters
      </Button>

      <div className="lg:ml-auto" />

      <div
        data-testid="doctors-view-toggle"
        className="inline-flex h-11 items-center rounded-2xl border border-border/60 bg-secondary/30 p-1"
      >
        <button
          data-testid="doctors-view-grid"
          onClick={() => onViewChange("grid")}
          className={cn(
            "flex h-9 w-10 items-center justify-center rounded-xl transition-all",
            view === "grid"
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Grid view"
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          data-testid="doctors-view-list"
          onClick={() => onViewChange("list")}
          className={cn(
            "flex h-9 w-10 items-center justify-center rounded-xl transition-all",
            view === "list"
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="List view"
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

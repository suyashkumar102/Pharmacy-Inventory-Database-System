import { Search, Calendar as CalIcon, ArrowRight, SlidersHorizontal, Table as TableIcon, Rows3, X } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "../../lib/utils";

const formatDate = (d) => {
  if (!d) return null;
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "short" })} ${d.getFullYear()}`;
};

export const PrescriptionsToolbar = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  startDate,
  endDate,
  onDateRangeChange,
  view,
  onViewChange,
}) => {
  const clearDates = () => onDateRangeChange({ from: undefined, to: undefined });

  return (
    <div data-testid="prescriptions-toolbar" className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <div className="relative flex-1 lg:max-w-xs">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          data-testid="prescriptions-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prescriptions..."
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 pl-10 text-sm placeholder:text-muted-foreground"
        />
      </div>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          data-testid="prescriptions-status-filter"
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm lg:w-44"
        >
          <SelectValue placeholder="All Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      {/* Date range */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            data-testid="prescriptions-date-range"
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-border/60 bg-secondary/30 px-4 text-sm text-foreground transition-colors hover:bg-secondary/60 lg:w-72"
          >
            <CalIcon className="h-4 w-4 text-muted-foreground" />
            <span className={cn(!startDate && "text-muted-foreground")}>{startDate ? formatDate(startDate) : "Start Date"}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
            <span className={cn(!endDate && "text-muted-foreground")}>{endDate ? formatDate(endDate) : "End Date"}</span>
            {(startDate || endDate) && (
              <span
                role="button"
                onClick={(e) => { e.stopPropagation(); clearDates(); }}
                className="ml-auto rounded-md p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                data-testid="prescriptions-date-range-clear"
              >
                <X className="h-3.5 w-3.5" />
              </span>
            )}
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            selected={{ from: startDate, to: endDate }}
            onSelect={(r) => onDateRangeChange(r ?? { from: undefined, to: undefined })}
            numberOfMonths={2}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button
        data-testid="prescriptions-filters-button"
        variant="outline"
        className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm font-medium text-foreground"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filters
      </Button>

      <div className="lg:ml-auto" />

      <div
        data-testid="prescriptions-view-toggle"
        className="inline-flex h-11 items-center rounded-2xl border border-border/60 bg-secondary/30 p-1"
      >
        <button
          data-testid="prescriptions-view-table"
          onClick={() => onViewChange("table")}
          className={cn(
            "flex h-9 w-10 items-center justify-center rounded-xl transition-all",
            view === "table"
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Table view"
        >
          <TableIcon className="h-4 w-4" />
        </button>
        <button
          data-testid="prescriptions-view-cards"
          onClick={() => onViewChange("cards")}
          className={cn(
            "flex h-9 w-10 items-center justify-center rounded-xl transition-all",
            view === "cards"
              ? "bg-primary/15 text-primary ring-1 ring-primary/30"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="Cards view"
        >
          <Rows3 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

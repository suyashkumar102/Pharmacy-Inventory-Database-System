import { Search, ArrowUpDown, SlidersHorizontal, LayoutGrid, List } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useDrugCategories } from "../../hooks/useDrugs";
import { cn } from "../../lib/utils";

export const SORT_OPTIONS = [
  { value: "name_asc", label: "Name (A - Z)" },
  { value: "name_desc", label: "Name (Z - A)" },
  { value: "price_asc", label: "Price (low → high)" },
  { value: "price_desc", label: "Price (high → low)" },
  { value: "stock_asc", label: "Stock (low → high)" },
  { value: "stock_desc", label: "Stock (high → low)" },
];

export const DrugsToolbar = ({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  sort,
  onSortChange,
  view,
  onViewChange,
}) => {
  const { data: categories } = useDrugCategories();

  return (
    <div
      data-testid="drugs-toolbar"
      className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-3"
    >
      {/* Search */}
      <div className="relative flex-1 lg:max-w-xs">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          data-testid="drugs-search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search drugs..."
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 pl-10 text-sm placeholder:text-muted-foreground"
        />
      </div>

      {/* Category */}
      <Select value={category} onValueChange={onCategoryChange}>
        <SelectTrigger
          data-testid="drugs-category-filter"
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm lg:w-48"
        >
          <SelectValue placeholder="All Categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Stock Status */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          data-testid="drugs-status-filter"
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm lg:w-44"
        >
          <SelectValue placeholder="Stock Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="in_stock">In Stock</SelectItem>
          <SelectItem value="low_stock">Low Stock</SelectItem>
          <SelectItem value="out_of_stock">Out of Stock</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort */}
      <Select value={sort} onValueChange={onSortChange}>
        <SelectTrigger
          data-testid="drugs-sort"
          className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm lg:w-44"
        >
          <ArrowUpDown className="mr-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Filters (decorative for now) */}
      <Button
        data-testid="drugs-filters-button"
        variant="outline"
        className="h-11 rounded-2xl border-border/60 bg-secondary/30 px-4 text-sm font-medium text-foreground"
      >
        <SlidersHorizontal className="mr-2 h-4 w-4" />
        Filters
      </Button>

      <div className="lg:ml-auto" />

      {/* View toggle */}
      <div
        data-testid="drugs-view-toggle"
        className="inline-flex h-11 items-center rounded-2xl border border-border/60 bg-secondary/30 p-1"
      >
        <button
          data-testid="drugs-view-grid"
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
          data-testid="drugs-view-list"
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

import { Calendar, Plus } from "lucide-react";
import { Button } from "../ui/button";

const formatToday = () => {
  const d = new Date();
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()}`;
};

export const DrugsHeader = ({ onAddDrug }) => {
  return (
    <div data-testid="drugs-header" className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Drugs</h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Manage and track all medicines in your inventory.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div
          data-testid="drugs-date-pill"
          className="inline-flex items-center gap-2.5 rounded-2xl border border-border/70 bg-card/60 px-4 py-2.5 backdrop-blur"
        >
          <Calendar className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium text-foreground">{formatToday()}</span>
        </div>

        <Button
          data-testid="add-drug-button"
          onClick={onAddDrug}
          className="h-11 rounded-2xl bg-primary px-5 font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-primary/30"
        >
          <Plus className="mr-1.5 h-4 w-4" strokeWidth={3} />
          Add Drug
        </Button>
      </div>
    </div>
  );
};

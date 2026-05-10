import { Pill, Calendar, User, Stethoscope, Download, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
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

const CAT_ICON = {
  pink: "bg-pink-500/15 text-pink-400 ring-pink-500/25",
  blue: "bg-chart-blue/15 text-chart-blue ring-chart-blue/25",
  green: "bg-chart-green/15 text-chart-green ring-chart-green/25",
  amber: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
  cyan: "bg-cyan-500/15 text-cyan-400 ring-cyan-500/25",
  purple: "bg-chart-purple/15 text-chart-purple ring-chart-purple/25",
  orange: "bg-chart-orange/15 text-chart-orange ring-chart-orange/25",
  slate: "bg-slate-500/15 text-slate-400 ring-slate-500/25",
};

const STATUS_PILL = {
  pending: "border-chart-orange/30 bg-chart-orange/10 text-chart-orange",
  completed: "border-chart-green/30 bg-chart-green/10 text-chart-green",
  cancelled: "border-chart-red/30 bg-chart-red/10 text-chart-red",
};

const STATUS_LABEL = { pending: "Pending", completed: "Completed", cancelled: "Cancelled" };

const formatDateTime = (iso) => {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
};

export const PrescriptionDetailDialog = ({ open, onOpenChange, prescription, onDownload }) => {
  if (!prescription) return null;
  const rx = prescription;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="prescription-detail-dialog"
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl rounded-2xl border-border/60 bg-card"
      >
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/25">
              <FileText className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl">Prescription #{rx.id}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {formatDateTime(rx.issuedAt)}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", STATUS_PILL[rx.status])}
            >
              {STATUS_LABEL[rx.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-3 pt-2">
          {/* Patient */}
          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <User className="mr-1.5 inline h-3 w-3" /> Patient
            </div>
            <div className="mt-2 flex items-center gap-3">
              <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-1", AVATAR_BG[rx.patient?.avatarColor ?? "blue"])}>
                {rx.patient?.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-semibold text-foreground">{rx.patient?.name}</div>
                <div className="text-xs tabular-nums text-muted-foreground">{rx.patient?.phone}</div>
              </div>
            </div>
          </div>

          {/* Doctor */}
          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              <Stethoscope className="mr-1.5 inline h-3 w-3" /> Prescribing Doctor
            </div>
            <div className="mt-1.5">
              <div className="font-semibold text-foreground">{rx.doctor?.name}</div>
              <div className="text-xs text-muted-foreground">{rx.doctor?.specialization}</div>
            </div>
          </div>

          {/* Medicines */}
          <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Pill className="mr-1.5 inline h-3 w-3" /> Medicines ({rx.medicines.length})
              </div>
            </div>
            <ul className="space-y-2">
              {rx.medicineDetails.map((m, i) => (
                <li key={i} className="flex items-center gap-3 rounded-lg border border-border/40 bg-card/50 p-2.5">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ring-1", CAT_ICON[m.categoryColor ?? "slate"])}>
                    <Pill className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-foreground">{m.drug?.name ?? "Unknown drug"}</div>
                    <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span><span className="font-medium text-foreground">{m.dosage}</span></span>
                      <span>{m.frequency}</span>
                      <span>{m.duration}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Notes */}
          {rx.notes && (
            <div className="rounded-xl border border-border/50 bg-secondary/20 p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                <Calendar className="mr-1.5 inline h-3 w-3" /> Notes
              </div>
              <p className="mt-1 text-sm text-foreground">{rx.notes}</p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="h-11 rounded-xl">
            Close
          </Button>
          <Button
            data-testid="prescription-detail-download"
            onClick={() => onDownload(rx)}
            className="h-11 rounded-xl bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <Download className="mr-1.5 h-4 w-4" />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

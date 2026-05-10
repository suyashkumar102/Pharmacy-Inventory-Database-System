import { Phone, Mail, BriefcaseMedical, Calendar, BadgeCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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

const STATUS_COLOR = {
  active: "border-chart-green/30 bg-chart-green/10 text-chart-green",
  on_leave: "border-chart-orange/30 bg-chart-orange/10 text-chart-orange",
  inactive: "border-slate-500/30 bg-slate-500/10 text-slate-400",
};

const STATUS_LABEL = {
  active: "Active",
  on_leave: "On Leave",
  inactive: "Inactive",
};

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()}`;
};

const Row = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3 rounded-xl border border-border/50 bg-secondary/20 px-3 py-2.5">
    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
    <div className="min-w-0 flex-1">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate text-sm font-medium text-foreground">{value}</div>
    </div>
  </div>
);

export const DoctorDetailDialog = ({ open, onOpenChange, doctor }) => {
  if (!doctor) return null;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="doctor-detail-dialog"
        className="sm:max-w-md rounded-2xl border-border/60 bg-card"
      >
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold ring-1", AVATAR_BG[doctor.avatarColor])}>
              {doctor.initials}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl">{doctor.name}</DialogTitle>
              <DialogDescription className="mt-0.5">
                {doctor.qualification} · #{doctor.id}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className={cn("rounded-full border px-2.5 py-1 text-xs font-semibold", STATUS_COLOR[doctor.status])}
            >
              {STATUS_LABEL[doctor.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <Row icon={BriefcaseMedical} label="Specialization" value={doctor.specialization} />
          <Row icon={Phone} label="Phone" value={doctor.phone} />
          <Row icon={Mail} label="Email" value={doctor.email} />
          <Row icon={Calendar} label="Joined" value={formatDateTime(doctor.addedAt)} />
          <Row icon={BadgeCheck} label="Doctor ID" value={`#${doctor.id}`} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

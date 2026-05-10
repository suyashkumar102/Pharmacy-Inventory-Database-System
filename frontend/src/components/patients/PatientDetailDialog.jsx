import { Phone, Mail, MapPin, Calendar, User } from "lucide-react";
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

const formatDateTime = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()} · ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
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

export const PatientDetailDialog = ({ open, onOpenChange, patient }) => {
  if (!patient) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="patient-detail-dialog"
        className="sm:max-w-md rounded-2xl border-border/60 bg-card"
      >
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-base font-bold ring-1", AVATAR_BG[patient.avatarColor])}>
              {patient.initials}
            </div>
            <div className="min-w-0 flex-1">
              <DialogTitle className="text-xl">{patient.name}</DialogTitle>
              <DialogDescription className="mt-0.5 capitalize">
                {patient.gender}, {patient.age} years · #{patient.id}
              </DialogDescription>
            </div>
            <Badge
              variant="outline"
              className="rounded-full border-chart-green/30 bg-chart-green/10 px-2.5 py-1 text-xs font-semibold capitalize text-chart-green"
            >
              {patient.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-2 pt-2">
          <Row icon={Phone} label="Phone" value={patient.phone} />
          <Row icon={Mail} label="Email" value={patient.email} />
          <Row
            icon={MapPin}
            label="Address"
            value={[patient.addressLine, patient.city, patient.state].filter(Boolean).join(", ")}
          />
          <Row icon={Calendar} label="Registered" value={formatDateTime(patient.registeredAt)} />
          <Row icon={User} label="Patient ID" value={`#${patient.id}`} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { Users, UserPlus, FileText, UserCheck } from "lucide-react";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

const COLOR = {
  green: { ring: "ring-chart-green/25", bg: "bg-chart-green/15", text: "text-chart-green" },
  blue: { ring: "ring-chart-blue/25", bg: "bg-chart-blue/15", text: "text-chart-blue" },
  purple: { ring: "ring-chart-purple/25", bg: "bg-chart-purple/15", text: "text-chart-purple" },
  orange: { ring: "ring-chart-orange/25", bg: "bg-chart-orange/15", text: "text-chart-orange" },
};

const KpiCard = ({ id, icon: Icon, label, value, subtitle, color }) => {
  const c = COLOR[color];
  return (
    <Card
      data-testid={`patients-kpi-${id}`}
      className="card-elevated flex items-center gap-5 overflow-hidden border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className={cn("flex h-16 w-16 shrink-0 items-center justify-center rounded-full ring-1", c.bg, c.ring)}>
        <Icon className={cn("h-7 w-7", c.text)} strokeWidth={2.25} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        <div className={cn("mt-0.5 truncate text-3xl font-bold tabular-nums leading-tight", c.text)}>
          {value}
        </div>
        <div className="mt-1 truncate text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </Card>
  );
};

const formatLastAddedDate = (iso) => {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleDateString("en-US", { month: "long" })} ${d.getFullYear()}`;
};

export const PatientsKPIs = ({ kpis }) => {
  const pct = (n) => (kpis.total > 0 ? Math.round((n / kpis.total) * 100) : 0);

  return (
    <div data-testid="patients-kpis" className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        id="total"
        icon={Users}
        label="Total Patients"
        value={kpis.total}
        subtitle="Registered"
        color="green"
      />
      <KpiCard
        id="this-month"
        icon={UserPlus}
        label="Added This Month"
        value={kpis.addedThisMonth}
        subtitle={`${pct(kpis.addedThisMonth)}% of total`}
        color="blue"
      />
      <KpiCard
        id="active"
        icon={FileText}
        label="Active Patients"
        value={kpis.active}
        subtitle={`${pct(kpis.active)}% of total`}
        color="purple"
      />
      <KpiCard
        id="last-added"
        icon={UserCheck}
        label="Last Added"
        value={formatLastAddedDate(kpis.lastAdded?.registeredAt)}
        subtitle={kpis.lastAdded?.name ?? "—"}
        color="orange"
      />
    </div>
  );
};

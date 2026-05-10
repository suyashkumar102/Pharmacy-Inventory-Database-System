import { Stethoscope, BriefcaseMedical, UserCheck, UserPlus } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

const COLOR = {
  green: { stroke: "hsl(var(--chart-green))", text: "text-chart-green", bg: "bg-chart-green/15", ring: "ring-chart-green/25" },
  blue: { stroke: "hsl(var(--chart-blue))", text: "text-chart-blue", bg: "bg-chart-blue/15", ring: "ring-chart-blue/25" },
  purple: { stroke: "hsl(var(--chart-purple))", text: "text-chart-purple", bg: "bg-chart-purple/15", ring: "ring-chart-purple/25" },
  orange: { stroke: "hsl(var(--chart-orange))", text: "text-chart-orange", bg: "bg-chart-orange/15", ring: "ring-chart-orange/25" },
};

const KpiCard = ({ id, icon: Icon, label, value, subtitle, color, series }) => {
  const c = COLOR[color];
  const gradId = `dockpi-${id}`;
  return (
    <Card
      data-testid={`doctors-kpi-${id}`}
      className="card-elevated relative flex flex-col overflow-hidden border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1", c.bg, c.ring)}>
          <Icon className={cn("h-6 w-6", c.text)} strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className={cn("mt-1 text-3xl font-bold tabular-nums leading-tight", c.text)}>{value}</div>
          <div className="mt-2 text-xs text-muted-foreground">{subtitle}</div>
        </div>
      </div>
      <div className="mt-4 -mx-2 h-14">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.stroke} stopOpacity={0.4} />
                <stop offset="100%" stopColor={c.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke={c.stroke}
              strokeWidth={2}
              fill={`url(#${gradId})`}
              isAnimationActive
              animationDuration={900}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export const DoctorsKPIs = ({ kpis, series }) => {
  const pct = (n) => (kpis.total > 0 ? Math.round((n / kpis.total) * 100) : 0);

  return (
    <div data-testid="doctors-kpis" className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        id="total"
        icon={Stethoscope}
        label="Total Doctors"
        value={kpis.total}
        subtitle="Registered in system"
        color="green"
        series={series.total}
      />
      <KpiCard
        id="specializations"
        icon={BriefcaseMedical}
        label="Specializations"
        value={kpis.specializations}
        subtitle="Unique specializations"
        color="blue"
        series={series.specializations}
      />
      <KpiCard
        id="active"
        icon={UserCheck}
        label="Active Doctors"
        value={kpis.active}
        subtitle="Currently available"
        color="purple"
        series={series.active}
      />
      <KpiCard
        id="this-month"
        icon={UserPlus}
        label="Added This Month"
        value={kpis.thisMonth}
        subtitle={`${pct(kpis.thisMonth)}% of total`}
        color="orange"
        series={series.thisMonth}
      />
    </div>
  );
};

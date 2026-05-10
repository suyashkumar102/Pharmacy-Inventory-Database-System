import { ClipboardList, Clock, CheckCircle2, XCircle, ArrowUp } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

const COLOR = {
  blue: { stroke: "hsl(var(--chart-blue))", text: "text-chart-blue", bg: "bg-chart-blue/15", ring: "ring-chart-blue/25" },
  orange: { stroke: "hsl(var(--chart-orange))", text: "text-chart-orange", bg: "bg-chart-orange/15", ring: "ring-chart-orange/25" },
  green: { stroke: "hsl(var(--chart-green))", text: "text-chart-green", bg: "bg-chart-green/15", ring: "ring-chart-green/25" },
  purple: { stroke: "hsl(var(--chart-purple))", text: "text-chart-purple", bg: "bg-chart-purple/15", ring: "ring-chart-purple/25" },
};

const KpiCard = ({ id, icon: Icon, label, value, subtitle, color, series, trend }) => {
  const c = COLOR[color];
  const gradId = `rxkpi-${id}`;
  return (
    <Card
      data-testid={`prescriptions-kpi-${id}`}
      className="card-elevated relative flex flex-col overflow-hidden border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div className={cn("flex h-14 w-14 shrink-0 items-center justify-center rounded-full ring-1", c.bg, c.ring)}>
          <Icon className={cn("h-6 w-6", c.text)} strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 text-4xl font-bold tabular-nums leading-tight text-foreground">{value}</div>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            {trend && (
              <span className={cn("inline-flex items-center gap-0.5 rounded-md bg-chart-green/10 px-1.5 py-0.5 font-semibold", "text-chart-green")}>
                <ArrowUp className="h-3 w-3" />
                {trend}
              </span>
            )}
            <span className={cn(!trend && "font-semibold", c.text)}>{subtitle}</span>
            {trend && <span className="text-muted-foreground">from last month</span>}
          </div>
        </div>
      </div>
      <div className="mt-4 -mx-2 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={series} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.stroke} stopOpacity={0.45} />
                <stop offset="100%" stopColor={c.stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area
              type="monotone"
              dataKey="y"
              stroke={c.stroke}
              strokeWidth={2.25}
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

export const PrescriptionsKPIs = ({ kpis, series }) => {
  const pct = (n) => (kpis.total > 0 ? ((n / kpis.total) * 100).toFixed(1) : "0");

  return (
    <div data-testid="prescriptions-kpis" className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        id="total"
        icon={ClipboardList}
        label="Total Prescriptions"
        value={kpis.total}
        trend="12.5%"
        subtitle=""
        color="blue"
        series={series.total}
      />
      <KpiCard
        id="pending"
        icon={Clock}
        label="Pending"
        value={kpis.pending}
        subtitle={`${pct(kpis.pending)}%`}
        color="orange"
        series={series.pending}
      />
      <KpiCard
        id="completed"
        icon={CheckCircle2}
        label="Completed"
        value={kpis.completed}
        subtitle={`${pct(kpis.completed)}%`}
        color="green"
        series={series.completed}
      />
      <KpiCard
        id="cancelled"
        icon={XCircle}
        label="Cancelled"
        value={kpis.cancelled}
        subtitle={`${pct(kpis.cancelled)}%`}
        color="purple"
        series={series.cancelled}
      />
    </div>
  );
};

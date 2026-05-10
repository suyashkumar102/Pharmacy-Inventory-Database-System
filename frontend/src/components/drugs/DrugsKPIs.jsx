import { Boxes, PackageCheck, AlertTriangle, PackageX, IndianRupee } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card } from "../ui/card";
import { cn } from "../../lib/utils";

const formatCurrency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n);

const COLOR = {
  green: { stroke: "hsl(var(--chart-green))", text: "text-chart-green", bg: "bg-chart-green/15", ring: "ring-chart-green/25" },
  blue: { stroke: "hsl(var(--chart-blue))", text: "text-chart-blue", bg: "bg-chart-blue/15", ring: "ring-chart-blue/25" },
  orange: { stroke: "hsl(var(--chart-orange))", text: "text-chart-orange", bg: "bg-chart-orange/15", ring: "ring-chart-orange/25" },
  purple: { stroke: "hsl(var(--chart-purple))", text: "text-chart-purple", bg: "bg-chart-purple/15", ring: "ring-chart-purple/25" },
  teal: { stroke: "hsl(var(--chart-green))", text: "text-chart-green", bg: "bg-chart-green/15", ring: "ring-chart-green/25" },
};

const KpiCard = ({ id, icon: Icon, label, value, subtitle, color, series }) => {
  const c = COLOR[color];
  const gradId = `dgrad-${id}`;
  return (
    <Card
      data-testid={`drugs-kpi-${id}`}
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
      <div className="mt-4 -mx-2 h-12">
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

export const DrugsKPIs = ({ kpis, series }) => {
  const pct = (n) => (kpis.total > 0 ? Math.round((n / kpis.total) * 100) : 0);

  return (
    <div data-testid="drugs-kpis" className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
      <KpiCard
        id="total"
        icon={Boxes}
        label="Total Drugs"
        value={kpis.total}
        subtitle="100% Total Medicines"
        color="green"
        series={series.total}
      />
      <KpiCard
        id="in-stock"
        icon={PackageCheck}
        label="In Stock"
        value={kpis.inStock}
        subtitle={`${pct(kpis.inStock)}% of total`}
        color="blue"
        series={series.inStock}
      />
      <KpiCard
        id="low-stock"
        icon={AlertTriangle}
        label="Low Stock"
        value={kpis.lowStock}
        subtitle={`${pct(kpis.lowStock)}% of total`}
        color="orange"
        series={series.lowStock}
      />
      <KpiCard
        id="out-of-stock"
        icon={PackageX}
        label="Out of Stock"
        value={kpis.outOfStock}
        subtitle={`${pct(kpis.outOfStock)}% of total`}
        color="purple"
        series={series.outOfStock}
      />
      <KpiCard
        id="value"
        icon={IndianRupee}
        label="Total Inventory Value"
        value={formatCurrency(kpis.value)}
        subtitle="Across all drugs"
        color="teal"
        series={series.value}
      />
    </div>
  );
};

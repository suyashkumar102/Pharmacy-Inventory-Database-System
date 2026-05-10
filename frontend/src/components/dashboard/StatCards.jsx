import {
  Pill,
  Users,
  FileText,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area } from "recharts";
import { Card } from "../ui/card";
import { useStats } from "../../hooks/useDashboard";
import { cn } from "../../lib/utils";

const ICON_MAP = { Pill, Users, FileText, AlertTriangle };

const COLOR_MAP = {
  green: {
    icon: "text-chart-green",
    iconBg: "bg-chart-green/15",
    iconRing: "ring-chart-green/20",
    value: "text-chart-green",
    stroke: "hsl(var(--chart-green))",
    deltaUp: "text-chart-green",
    deltaDown: "text-chart-red",
  },
  blue: {
    icon: "text-chart-blue",
    iconBg: "bg-chart-blue/15",
    iconRing: "ring-chart-blue/20",
    value: "text-chart-blue",
    stroke: "hsl(var(--chart-blue))",
    deltaUp: "text-chart-blue",
    deltaDown: "text-chart-red",
  },
  purple: {
    icon: "text-chart-purple",
    iconBg: "bg-chart-purple/15",
    iconRing: "ring-chart-purple/20",
    value: "text-chart-purple",
    stroke: "hsl(var(--chart-purple))",
    deltaUp: "text-chart-purple",
    deltaDown: "text-chart-red",
  },
  orange: {
    icon: "text-chart-orange",
    iconBg: "bg-chart-orange/15",
    iconRing: "ring-chart-orange/20",
    value: "text-chart-orange",
    stroke: "hsl(var(--chart-orange))",
    deltaUp: "text-chart-orange",
    deltaDown: "text-chart-red",
  },
};

const StatCard = ({ stat }) => {
  const Icon = ICON_MAP[stat.icon] ?? Pill;
  const c = COLOR_MAP[stat.color];
  const isUp = stat.direction === "up";
  const gradId = `grad-${stat.id}`;

  return (
    <Card
      data-testid={`stat-card-${stat.id}`}
      className="card-elevated relative overflow-hidden border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ring-1",
            c.iconBg,
            c.iconRing
          )}
        >
          <Icon className={cn("h-6 w-6", c.icon)} strokeWidth={2.25} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
          <div className={cn("mt-1 text-4xl font-bold tabular-nums", c.value)}>{stat.value}</div>
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            <span
              className={cn(
                "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 font-semibold",
                isUp ? c.deltaUp : c.deltaDown,
                isUp ? "bg-chart-green/10" : "bg-chart-red/10"
              )}
            >
              {isUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
              {stat.delta}%
            </span>
            <span className="text-muted-foreground">{stat.period}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 -mx-2 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stat.series} margin={{ top: 6, right: 0, left: 0, bottom: 0 }}>
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

export const StatCards = () => {
  const { data: stats } = useStats();
  return (
    <div data-testid="stat-cards" className="stagger grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((s) => (
        <StatCard key={s.id} stat={s} />
      ))}
    </div>
  );
};

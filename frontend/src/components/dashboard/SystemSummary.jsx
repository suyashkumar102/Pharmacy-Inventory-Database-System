import { useNavigate } from "react-router-dom";
import { PieChart as PieIcon } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "../ui/card";
import { useSystemSummary } from "../../hooks/useDashboard";
import { cn } from "../../lib/utils";

const COLOR_FILL = {
  green:  "hsl(var(--chart-green))",
  blue:   "hsl(var(--chart-blue))",
  purple: "hsl(var(--chart-purple))",
  orange: "hsl(var(--chart-orange))",
};

const ROUTES = {
  Drugs:         "/drugs",
  Patients:      "/patients",
  Doctors:       "/doctors",
  Prescriptions: "/prescriptions",
};

export const SystemSummary = () => {
  const { data: items } = useSystemSummary();
  const navigate = useNavigate();
  const total = items.reduce((sum, i) => sum + i.value, 0);
  const display = items.map((i) => ({ ...i, fill: COLOR_FILL[i.color] }));
  const safe = total === 0 ? [{ name: "n/a", value: 1, fill: "hsl(var(--muted))" }] : display;

  return (
    <Card
      data-testid="system-summary"
      className="border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-purple/15 text-chart-purple">
          <PieIcon className="h-4 w-4" />
        </div>
        <h3 className="text-base font-semibold text-foreground">System Summary</h3>
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row">
        {/* Clickable pie */}
        <div
          className="relative h-44 w-44 shrink-0 cursor-pointer"
          title="View all records"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={safe}
                dataKey="value"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={3}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                isAnimationActive
                animationDuration={900}
                onClick={(entry) => {
                  const route = ROUTES[entry?.name];
                  if (route) navigate(route);
                }}
              >
                {safe.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} className="cursor-pointer" />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold tabular-nums text-foreground">{total}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Records</div>
          </div>
        </div>

        <div className="flex-1 w-full space-y-2.5">
          {items.map((i) => (
            <div
              key={i.label}
              data-testid={`summary-${i.label.toLowerCase()}`}
              onClick={() => navigate(ROUTES[i.label] || "/")}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/40 bg-secondary/20 px-3 py-2.5 transition-colors hover:bg-secondary/40 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <span className={cn("h-2.5 w-2.5 rounded-full", `bg-chart-${i.color}`)} />
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{i.label}</span>
              </div>
              <span className={cn("text-sm font-bold tabular-nums", `text-chart-${i.color}`)}>{i.value}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

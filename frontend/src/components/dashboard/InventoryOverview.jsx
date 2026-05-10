import { useNavigate } from "react-router-dom";
import { Package } from "lucide-react";
import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { useInventoryOverview } from "../../hooks/useDashboard";
import { cn } from "../../lib/utils";

const Stat = ({ label, value, total, color, testid, filterStatus, navigate }) => {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div
      data-testid={testid}
      className="flex-1 cursor-pointer group"
      onClick={() => navigate(`/drugs?status=${filterStatus}`)}
    >
      <div className={cn("text-3xl font-bold tabular-nums group-hover:opacity-80 transition-opacity", `text-chart-${color}`)}>{value}</div>
      <div className="mt-0.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-2 text-xs font-semibold text-muted-foreground tabular-nums">{pct}%</div>
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-secondary/60">
        <div
          className={cn("h-full rounded-full transition-all", `bg-chart-${color}`)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};

export const InventoryOverview = () => {
  const { data } = useInventoryOverview();
  const navigate = useNavigate();

  const segments = [
    { name: "In Stock",     value: data.inStock,    fill: "hsl(var(--chart-green))",  filter: "in_stock"    },
    { name: "Low Stock",    value: data.lowStock,   fill: "hsl(var(--chart-orange))", filter: "low_stock"   },
    { name: "Out of Stock", value: data.outOfStock, fill: "hsl(var(--chart-red))",    filter: "out_of_stock"},
  ];
  const display = segments.every((s) => s.value === 0)
    ? [{ name: "n/a", value: 1, fill: "hsl(var(--muted))" }]
    : segments;

  return (
    <Card
      data-testid="inventory-overview"
      className="border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-green/15 text-chart-green">
            <Package className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Inventory Overview</h3>
        </div>
        <Button
          data-testid="view-all-inventory"
          variant="outline"
          size="sm"
          onClick={() => navigate("/drugs")}
          className="rounded-full border-border/70 bg-secondary/40 text-xs font-medium"
        >
          View all
        </Button>
      </div>

      <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
        {/* Clickable pie chart */}
        <div className="relative h-44 w-44 shrink-0 cursor-pointer" onClick={() => navigate("/drugs")}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={display}
                dataKey="value"
                innerRadius={58}
                outerRadius={82}
                paddingAngle={3}
                stroke="none"
                startAngle={90}
                endAngle={-270}
                isAnimationActive
                animationDuration={900}
              >
                {display.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-3xl font-bold tabular-nums text-foreground">{data.total}</div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total Drugs</div>
          </div>
        </div>

        <div className="flex w-full flex-1 items-start gap-6">
          <Stat label="In Stock"     value={data.inStock}    total={data.total} color="green"  testid="inv-in-stock"     filterStatus="in_stock"     navigate={navigate} />
          <Stat label="Low Stock"    value={data.lowStock}   total={data.total} color="orange" testid="inv-low-stock"    filterStatus="low_stock"    navigate={navigate} />
          <Stat label="Out of Stock" value={data.outOfStock} total={data.total} color="red"    testid="inv-out-of-stock" filterStatus="out_of_stock" navigate={navigate} />
        </div>
      </div>
    </Card>
  );
};

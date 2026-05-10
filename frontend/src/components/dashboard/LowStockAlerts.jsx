import { useNavigate } from "react-router-dom";
import { Bell, Pill } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useLowStock } from "../../hooks/useDashboard";

export const LowStockAlerts = () => {
  const { data: items } = useLowStock();
  const navigate = useNavigate();

  return (
    <Card
      data-testid="low-stock-alerts"
      className="border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-red/15 text-chart-red">
            <Bell className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Low Stock Alerts</h3>
        </div>
        <Button
          data-testid="view-all-low-stock"
          variant="outline"
          size="sm"
          onClick={() => navigate("/drugs")}
          className="rounded-full border-border/70 bg-secondary/40 text-xs font-medium"
        >
          View all
        </Button>
      </div>

      <div className="space-y-2.5">
        {items.length === 0 ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">All stock levels are healthy</div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              data-testid={`low-stock-item-${item.id}`}
              onClick={() => navigate(`/drugs?q=${encodeURIComponent(item.name)}`)}
              className="group flex items-center gap-3 rounded-xl border border-border/50 bg-secondary/30 p-3 transition-colors hover:border-chart-red/30 hover:bg-chart-red/5 cursor-pointer"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-chart-red/10 text-chart-red ring-1 ring-chart-red/20">
                <Pill className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate text-sm font-semibold text-foreground">{item.name}</div>
                <div className="text-xs text-muted-foreground">
                  <span className="tabular-nums">{item.units}</span> units left
                </div>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-chart-red/30 bg-chart-red/10 px-2.5 py-0.5 text-xs font-medium text-chart-red"
              >
                Low Stock
              </Badge>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

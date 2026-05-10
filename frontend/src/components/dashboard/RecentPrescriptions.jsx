import { useNavigate } from "react-router-dom";
import { ClipboardList } from "lucide-react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useRecentPrescriptions } from "../../hooks/useDashboard";
import { cn } from "../../lib/utils";

const STATUS_STYLES = {
  pending: "bg-chart-orange/15 text-chart-orange border-chart-orange/30",
  completed: "bg-chart-green/15 text-chart-green border-chart-green/30",
  cancelled: "bg-chart-red/15 text-chart-red border-chart-red/30",
};

export const RecentPrescriptions = () => {
  const { data: prescriptions } = useRecentPrescriptions();
  const navigate = useNavigate();

  return (
    <Card
      data-testid="recent-prescriptions"
      className="border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <ClipboardList className="h-4 w-4" />
          </div>
          <h3 className="text-base font-semibold text-foreground">Recent Prescriptions</h3>
        </div>
        <Button
          data-testid="view-all-prescriptions"
          variant="outline"
          size="sm"
          onClick={() => navigate("/prescriptions")}
          className="rounded-full border-border/70 bg-secondary/40 text-xs font-medium"
        >
          View all
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/50">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/50 bg-secondary/30 text-left">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">ID</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Doctor</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {prescriptions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No recent prescriptions
                </td>
              </tr>
            ) : (
              prescriptions.map((p) => (
                <tr
                  key={p.id}
                  data-testid={`prescription-row-${p.id}`}
                  onClick={() => navigate(`/prescriptions?q=${encodeURIComponent(String(p.id))}`)}
                  className="border-b border-border/40 last:border-0 transition-colors hover:bg-secondary/30 cursor-pointer"
                >
                  <td className="px-4 py-4 font-mono text-xs text-muted-foreground">#{p.id}</td>
                  <td className="px-4 py-4 font-medium text-foreground">{p.patient}</td>
                  <td className="px-4 py-4 text-muted-foreground">{p.doctor}</td>
                  <td className="px-4 py-4 text-muted-foreground">{p.date}</td>
                  <td className="px-4 py-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "rounded-full border px-2.5 py-0.5 text-xs font-medium capitalize",
                        STATUS_STYLES[p.status]
                      )}
                    >
                      {p.status}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Spacer to mimic the screenshot vertical breathing room */}
      <div className="min-h-[120px]" />
    </Card>
  );
};

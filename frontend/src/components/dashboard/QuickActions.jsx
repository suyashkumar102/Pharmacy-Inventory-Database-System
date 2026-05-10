import { useNavigate } from "react-router-dom";
import { Zap, PlusCircle, UserPlus, Stethoscope, FileText } from "lucide-react";
import { Card } from "../ui/card";
import { useQuickActions } from "../../hooks/useDashboard";
import { cn } from "../../lib/utils";

const ICONS = { PlusCircle, UserPlus, Stethoscope, FileText };

const COLOR_MAP = {
  green: {
    bg: "bg-chart-green/10 hover:bg-chart-green/20 border-chart-green/30",
    icon: "text-chart-green bg-chart-green/15",
    text: "text-chart-green",
  },
  blue: {
    bg: "bg-chart-blue/10 hover:bg-chart-blue/20 border-chart-blue/30",
    icon: "text-chart-blue bg-chart-blue/15",
    text: "text-chart-blue",
  },
  purple: {
    bg: "bg-chart-purple/10 hover:bg-chart-purple/20 border-chart-purple/30",
    icon: "text-chart-purple bg-chart-purple/15",
    text: "text-chart-purple",
  },
  orange: {
    bg: "bg-chart-orange/10 hover:bg-chart-orange/20 border-chart-orange/30",
    icon: "text-chart-orange bg-chart-orange/15",
    text: "text-chart-orange",
  },
};

const ROUTES = {
  "add-drug": "/drugs",
  "add-patient": "/patients",
  "add-doctor": "/doctors",
  "new-rx": "/prescriptions",
};

export const QuickActions = () => {
  const { data: actions } = useQuickActions();
  const navigate = useNavigate();

  return (
    <Card
      data-testid="quick-actions"
      className="border-border/60 bg-card/70 p-5 backdrop-blur"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-chart-orange/15 text-chart-orange">
          <Zap className="h-4 w-4" fill="currentColor" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Quick Actions</h3>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {actions.map((a) => {
          const Icon = ICONS[a.icon] ?? PlusCircle;
          const c = COLOR_MAP[a.color];
          return (
            <button
              key={a.id}
              data-testid={`quick-action-${a.id}`}
              onClick={() => navigate(ROUTES[a.id] || "/")}
              className={cn(
                "group flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all duration-200 hover:-translate-y-0.5",
                c.bg
              )}
            >
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110", c.icon)}>
                <Icon className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <span className={cn("text-xs font-semibold", c.text)}>{a.label}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
};

import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Pill,
  Users,
  Stethoscope,
  FileText,
  ChevronUp,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { useCurrentUser } from "../../hooks/useDashboard";

const NAV_ITEMS = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true, testid: "nav-dashboard" },
  { to: "/drugs", label: "Drugs", icon: Pill, testid: "nav-drugs" },
  { to: "/patients", label: "Patients", icon: Users, testid: "nav-patients" },
  { to: "/doctors", label: "Doctors", icon: Stethoscope, testid: "nav-doctors" },
  { to: "/prescriptions", label: "Prescriptions", icon: FileText, testid: "nav-prescriptions" },
];

export const Sidebar = ({ collapsed }) => {
  const { data: user } = useCurrentUser();

  return (
    <aside
      data-testid="app-sidebar"
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border",
        "transition-[width] duration-300 ease-out",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand */}
      <div className={cn("flex items-center gap-3 px-5 pt-6 pb-8", collapsed && "px-4 justify-center")}>
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-lg shadow-primary/20">
          <Pill className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="text-lg font-bold tracking-tight text-foreground leading-none">PIPMS</div>
            <div className="mt-1 text-[10px] font-medium leading-tight text-muted-foreground">
              Pharmacy &amp; Inventory<br />Management System
            </div>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              data-testid={item.testid}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-all duration-200",
                  collapsed && "justify-center px-2",
                  isActive
                    ? "bg-primary/10 text-primary border border-primary/30 shadow-[0_0_0_1px_hsl(var(--primary)/0.1)_inset]"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && !collapsed && (
                    <span className="absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-primary" />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                      isActive && "text-primary"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {!collapsed && <span>{item.label}</span>}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User card */}
      <div className="p-3">
        <button
          data-testid="sidebar-user-menu"
          className={cn(
            "group flex w-full items-center gap-3 rounded-xl border border-sidebar-border bg-card/40 p-3 text-left transition-colors hover:bg-card",
            collapsed && "justify-center p-2"
          )}
        >
          <div className="relative">
            <Avatar className="h-9 w-9 border border-primary/30">
              <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-sidebar pulse-dot" />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <div className="truncate text-sm font-semibold text-foreground">{user.name}</div>
                <div className="truncate text-xs text-muted-foreground">{user.role}</div>
              </div>
              <ChevronUp className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5" />
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

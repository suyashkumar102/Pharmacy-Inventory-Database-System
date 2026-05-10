import { WelcomeHeader } from "../components/dashboard/WelcomeHeader";
import { StatCards } from "../components/dashboard/StatCards";
import { RecentPrescriptions } from "../components/dashboard/RecentPrescriptions";
import { LowStockAlerts } from "../components/dashboard/LowStockAlerts";
import { QuickActions } from "../components/dashboard/QuickActions";
import { InventoryOverview } from "../components/dashboard/InventoryOverview";
import { SystemSummary } from "../components/dashboard/SystemSummary";

export default function Dashboard() {
  return (
    <div data-testid="dashboard-page" className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">
      <WelcomeHeader />
      <StatCards />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <RecentPrescriptions />
        </div>
        <div className="flex flex-col gap-5">
          <LowStockAlerts />
          <QuickActions />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <InventoryOverview />
        <SystemSummary />
      </div>
    </div>
  );
}

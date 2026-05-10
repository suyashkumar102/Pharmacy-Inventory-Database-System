import { Calendar } from "lucide-react";
import { useCurrentUser } from "../../hooks/useDashboard";

const formatToday = () => {
  const d = new Date();
  const day = d.getDate();
  const month = d.toLocaleDateString("en-US", { month: "long" });
  const year = d.getFullYear();
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  return `${day} ${month} ${year}, ${weekday}`;
};

export const WelcomeHeader = () => {
  const { data: user } = useCurrentUser();
  const firstName = user.name.split(" ")[0];

  return (
    <div data-testid="welcome-header" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Welcome back, {firstName}!
          <span className="inline-block animate-fade-in" role="img" aria-label="wave">
            👋
          </span>
        </h1>
        <p className="mt-2 text-sm text-muted-foreground sm:text-base">
          Here&apos;s what&apos;s happening at your pharmacy today.
        </p>
      </div>
      <div
        data-testid="today-pill"
        className="inline-flex items-center gap-2.5 self-start rounded-2xl border border-border/70 bg-card/60 px-4 py-2.5 backdrop-blur"
      >
        <Calendar className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{formatToday()}</span>
      </div>
    </div>
  );
};

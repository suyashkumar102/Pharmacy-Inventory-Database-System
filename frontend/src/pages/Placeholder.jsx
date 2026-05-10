import { Construction } from "lucide-react";
import { Card } from "../components/ui/card";

export default function Placeholder({ title }) {
  return (
    <div data-testid="placeholder-page" className="mx-auto flex w-full max-w-[1600px]">
      <Card className="flex w-full flex-col items-center gap-4 border-dashed border-border/60 bg-card/40 p-12 text-center backdrop-blur">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <Construction className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">
            This panel will be added next. The Dashboard above is fully designed and ready to be wired to your backend.
          </p>
        </div>
      </Card>
    </div>
  );
}

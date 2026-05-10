import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "../../lib/utils";

export const DrugsPagination = ({ page, pageSize, total, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(total, page * pageSize);

  const go = (p) => onPageChange(Math.min(Math.max(1, p), totalPages));

  return (
    <div data-testid="drugs-pagination" className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
      <div className="text-sm text-muted-foreground">
        Showing <span className="font-semibold text-foreground tabular-nums">{start}</span> to{" "}
        <span className="font-semibold text-foreground tabular-nums">{end}</span> of{" "}
        <span className="font-semibold text-foreground tabular-nums">{total}</span> results
      </div>

      <div className="inline-flex items-center gap-1.5 rounded-2xl border border-border/60 bg-secondary/30 p-1.5">
        <PageBtn onClick={() => go(1)} disabled={page === 1} testid="page-first">
          <ChevronsLeft className="h-4 w-4" />
        </PageBtn>
        <PageBtn onClick={() => go(page - 1)} disabled={page === 1} testid="page-prev">
          <ChevronLeft className="h-4 w-4" />
        </PageBtn>

        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
          <button
            key={p}
            onClick={() => go(p)}
            data-testid={`page-${p}`}
            className={cn(
              "h-8 min-w-8 rounded-lg px-2.5 text-sm font-semibold tabular-nums transition-colors",
              p === page
                ? "bg-primary text-primary-foreground shadow shadow-primary/30"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            {p}
          </button>
        ))}

        <PageBtn onClick={() => go(page + 1)} disabled={page === totalPages} testid="page-next">
          <ChevronRight className="h-4 w-4" />
        </PageBtn>
        <PageBtn onClick={() => go(totalPages)} disabled={page === totalPages} testid="page-last">
          <ChevronsRight className="h-4 w-4" />
        </PageBtn>
      </div>
    </div>
  );
};

const PageBtn = ({ children, onClick, disabled, testid }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    data-testid={testid}
    className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
  >
    {children}
  </button>
);

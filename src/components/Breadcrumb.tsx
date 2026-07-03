import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  id: string | null; // null = Home
  name: string;
}

export function Breadcrumb({
  crumbs,
  onNavigate,
}: {
  crumbs: Crumb[];
  onNavigate: (index: number) => void;
}) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm">
      {crumbs.map((c, i) => {
        const last = i === crumbs.length - 1;
        return (
          <span key={c.id ?? "home"} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
            <button
              onClick={() => !last && onNavigate(i)}
              disabled={last}
              className={
                "mono flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs uppercase tracking-[0.12em] transition " +
                (last
                  ? "font-semibold text-brand-700"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700")
              }
            >
              {i === 0 && <Home className="h-3.5 w-3.5" />}
              {c.name}
            </button>
          </span>
        );
      })}
    </nav>
  );
}

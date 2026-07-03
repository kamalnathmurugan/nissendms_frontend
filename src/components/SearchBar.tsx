import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { search, type SearchResult } from "../api";
import { iconFor } from "./nodeStyle";

export function SearchBar({
  onNavigate,
}: {
  onNavigate: (r: SearchResult) => void;
}) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        setResults(await search(q));
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pick = (r: SearchResult) => {
    onNavigate(r);
    setOpen(false);
    setQ("");
  };

  return (
    <div ref={boxRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Search vessels, files, or reports..."
          className="w-full rounded-2xl border border-slate-300/80 bg-linear-to-b from-white to-slate-50 py-2.5 pl-11 pr-9 text-sm text-slate-700 shadow-inner shadow-white/60 focus:border-brand-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
        />
        {q && (
          <button
            onClick={() => {
              setQ("");
              setResults([]);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute z-40 mt-2 max-h-96 w-full overflow-y-auto rounded-2xl border border-slate-200 bg-white/95 py-1 shadow-xl backdrop-blur">
          {results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-slate-500">No matches.</p>
          ) : (
            results.map((r) => {
              const { Icon, cls } = iconFor({
                ...r,
                upload: false,
                month_driven: false,
                has_children: false,
              });
              return (
                <button
                  key={r.id}
                  onClick={() => pick(r)}
                  className="flex w-full items-start gap-3 px-4 py-2 text-left transition hover:bg-slate-50"
                >
                  <Icon className={"mt-0.5 h-4 w-4 shrink-0 " + cls} />
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-slate-800">
                      {r.name}
                    </span>
                    <span className="block truncate text-xs text-slate-400">
                      {r.path}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

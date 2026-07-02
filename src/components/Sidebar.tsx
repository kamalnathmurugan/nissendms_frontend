import {
  Compass,
  Gauge,
  LifeBuoy,
  LogOut,
  Sparkles,
  Upload,
} from "lucide-react";
import type { FolderNode } from "../api";
import { MAIN_ACCENTS } from "./nodeStyle";

interface Props {
  view: "dashboard" | "explorer";
  mains: FolderNode[];
  selectedMainId: string | null;
  onDashboard: () => void;
  onSelectMain: (node: FolderNode) => void;
  onNewVessel: () => void;
}

export function Sidebar({
  view,
  mains,
  selectedMainId,
  onDashboard,
  onSelectMain,
  onNewVessel,
}: Props) {
  const navClass = (active: boolean) =>
    "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition " +
    (active
      ? "bg-linear-to-r from-brand-500 to-cyan-500 text-white shadow-md shadow-cyan-900/15"
      : "text-slate-700 hover:bg-white hover:shadow-sm");

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-r border-slate-200/80 bg-linear-to-b from-white/95 via-[#f8f8ff] to-[#f0eefb] px-4 py-4 backdrop-blur">
      <div className="mb-4 rounded-2xl border border-brand-100/80 bg-linear-to-br from-brand-50 via-white to-cyan-50 p-4 shadow-sm">
        <button
          onClick={onDashboard}
          className="w-full rounded-xl text-left transition hover:bg-white/60"
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-brand-700">
            Vessel DMS
          </h1>
          <p className="mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
            Deep Sea Operations
          </p>
        </button>

        <div className="mt-4 rounded-xl border border-brand-100 bg-white/80 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <p className="mono text-[10px] font-semibold uppercase tracking-[0.15em] text-brand-700">
              Control Room
            </p>
          </div>
          <p className="mt-1 text-xs text-slate-600">
            Navigate your fleet folders with a clean, structured command view.
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 overflow-y-auto px-1 pb-4">
        <button onClick={onDashboard} className={navClass(view === "dashboard")}>
          <Gauge className="h-4 w-4" />
          Dashboard
        </button>

        <div className="pt-3">
          <div className="mb-2 flex items-center justify-between px-2">
            <p className="mono text-[10px] uppercase tracking-[0.18em] text-slate-400">
              Main Folders
            </p>
            <Compass className="h-3.5 w-3.5 text-slate-400" />
          </div>

          <div className="space-y-2">
            {mains.map((m) => {
              const accent = MAIN_ACCENTS[m.name];
              const active = view === "explorer" && selectedMainId === m.id;
              const dotClass = accent?.chip ?? "bg-brand-300";
              const textClass = accent?.text ?? "text-brand-700";

              return (
                <button
                  key={m.id}
                  onClick={() => onSelectMain(m)}
                  className={
                    "group relative w-full overflow-hidden rounded-2xl border px-3 py-2.5 text-left transition " +
                    (active
                      ? "border-brand-200 bg-white shadow-sm"
                      : "border-slate-200 bg-white/80 hover:border-brand-200 hover:bg-white")
                  }
                >
                  <div className="pointer-events-none absolute -right-8 -top-8 h-14 w-14 rounded-full bg-white/60" />

                  <span className="flex items-center gap-2.5">
                    <span className={"h-2.5 w-2.5 rounded-full " + dotClass} />
                    <span className="truncate text-xs font-semibold text-slate-700">{m.name}</span>
                  </span>

                  <span className="mt-1.5 flex items-center justify-between text-[10px]">
                    <span className={"mono rounded-full px-1.5 py-0.5 uppercase tracking-[0.12em] " + dotClass + " " + textClass}>
                      main
                    </span>
                    <span className="mono uppercase tracking-[0.12em] text-slate-400 group-hover:text-brand-700">
                      open
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-3">
          <p className="mono text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Quick Action
          </p>
          <button
            onClick={onNewVessel}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-700 px-3 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-600"
          >
            <Upload className="h-4 w-4" />
            Upload Documents
          </button>
        </div>
      </nav>

      <div className="space-y-2 border-t border-slate-200 px-1 pt-4">
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 transition hover:bg-white hover:text-slate-900">
          <LifeBuoy className="h-4 w-4" />
          Support
        </button>
        <button className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm text-slate-600 transition hover:bg-white hover:text-slate-900">
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

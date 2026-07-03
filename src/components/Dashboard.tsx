import {
  ArrowRight,
  CalendarClock,
  ChartNoAxesColumn,
} from "lucide-react";
import type { FolderNode, Vessel } from "../api";
import { MAIN_ACCENTS } from "./nodeStyle";

interface Props {
  vessels: Vessel[];
  tree: FolderNode[];
  onOpenMain: (node: FolderNode) => void;
  onOpenVessel: (vessel: Vessel) => void;
  onNewVessel: () => void;
}

const MAIN_FOLDER_IMAGES: Record<string, string> = {
  "Technical & Crewing": "/images/folders/technical-crewing.svg",
  "Commercial & Chartering": "/images/folders/commercial-chartering.svg",
  Insurance: "/images/folders/insurance.svg",
};

function countKinds(tree: FolderNode[]) {
  let files = 0;
  let monthDriven = 0;
  let months = 0;
  const walk = (n: FolderNode) => {
    if (n.kind === "file") files++;
    if (n.month_driven) monthDriven++;
    if (n.kind === "month") months++;
    n.children?.forEach(walk);
  };
  tree.forEach(walk);
  return { files, monthDriven, months };
}

function sparkPath(points: number[], width = 122, height = 40): string {
  if (points.length < 2) return "";
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1);
  const stepX = width / (points.length - 1);

  return points
    .map((p, i) => {
      const x = i * stepX;
      const y = height - ((p - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

export function Dashboard({ vessels, tree, onOpenMain, onOpenVessel, onNewVessel }: Props) {
  const { files, monthDriven, months } = countKinds(tree);

  const stats: {
    label: string;
    value: string;
    sub: string;
    percent: number;
    color: string;
    chart: number[];
    bars: number[];
  }[] = [
      {
        label: "Vessels",
        value: String(vessels.length),
        sub: `${Math.max(vessels.length - 1, 0)} active`,
        percent: Math.max(10, Math.min(95, vessels.length * 18)),
        color: "#0f8f87",
        chart: [18, 24, 22, 30, 33, 35, 39],
        bars: [5, 8, 6, 10, 9, 12],
      },
      {
        label: "Main Folders",
        value: String(tree.length),
        sub: "Standardized",
        percent: 75,
        color: "#c026d3",
        chart: [40, 41, 44, 45, 46, 49, 52],
        bars: [4, 7, 8, 9, 10, 11],
      },
      {
        label: "Auto-Month",
        value: String(monthDriven),
        sub: "Archived",
        percent: monthDriven > 0 ? 62 : 28,
        color: "#ea580c",
        chart: [12, 14, 14, 16, 19, 21, 25],
        bars: [3, 4, 5, 6, 6, 7],
      },
      {
        label: "Documents",
        value: files > 999 ? `${(files / 1000).toFixed(1)}k` : String(files),
        sub: "Encrypted",
        percent: files > 0 ? 86 : 35,
        color: "#0891b2",
        chart: [25, 28, 31, 35, 38, 40, 44],
        bars: [6, 8, 9, 11, 13, 14],
      },
    ];

  return (
    <div className="w-full space-y-6 px-2 md:px-3">
      <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-linear-to-r from-white/70 via-[#f8f6ff]/85 to-white/70 px-6 py-5 shadow-sm backdrop-blur">
        <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-linear-to-br from-cyan-100/70 to-brand-100/20" />
        <div className="pointer-events-none absolute -right-8 -top-14 h-44 w-44 rounded-[35%] bg-linear-to-br from-fuchsia-100/65 to-violet-100/20" />
        <div className="pointer-events-none absolute bottom-0 right-24 h-16 w-36 rounded-t-full bg-white/45" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mono mb-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-700">
              Command Center
            </p>
            <h2 className="text-5xl font-extrabold tracking-tight text-ink">Operations Dashboard</h2>
            <p className="mt-1 text-sm text-slate-500">Live monitoring for Deep Sea Logistics Fleet 7</p>
          </div>
          <span className="mono relative rounded-xl border border-brand-200 bg-brand-50/90 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-brand-700 shadow-sm">
            Real-time View
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, idx) => (
          <div
            key={s.label}
            className="relative border-b border-slate-300/70 pb-4"
          >
            <div className="relative mb-4 flex items-center justify-between">
              <p className="mono text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-600">
                {s.label}
              </p>
              <span className="mono rounded-full border border-slate-300 bg-white/70 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                Live
              </span>
            </div>

            <div className="relative">
              <p className="text-5xl font-extrabold tracking-tight text-ink">{s.value}</p>
              <p className="mt-1 text-xs font-medium text-slate-600">{s.sub}</p>

              {/* Different chart shape per metric card */}
              {idx === 0 && (
                <div className="mt-3 flex items-center gap-4">
                  <div
                    className="relative h-20 w-20 shrink-0 rounded-full"
                    style={{
                      background: `conic-gradient(${s.color} ${s.percent * 3.6}deg, #dbe3ef 0deg)`,
                    }}
                  >
                    <div className="absolute inset-[9px] grid place-items-center rounded-full bg-white/95">
                      <span className="mono text-[10px] font-semibold uppercase text-slate-600">{s.percent}%</span>
                    </div>
                  </div>
                  <svg className="h-12 w-full" viewBox="0 0 122 40" fill="none" preserveAspectRatio="none">
                    <path d={sparkPath(s.chart)} stroke={s.color} strokeWidth="2.4" strokeLinecap="round" />
                  </svg>
                </div>
              )}

              {idx === 1 && (
                <div className="mt-4 flex h-16 items-end gap-1.5">
                  {s.bars.map((b, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-md bg-linear-to-t from-fuchsia-500 to-violet-400"
                      style={{ height: `${b * 4}px`, opacity: 0.45 + i * 0.08 }}
                    />
                  ))}
                </div>
              )}

              {idx === 2 && (
                <div className="mt-3">
                  <svg className="h-14 w-full" viewBox="0 0 122 40" fill="none" preserveAspectRatio="none">
                    <path d={sparkPath(s.chart)} stroke={s.color} strokeWidth="2.2" strokeLinecap="round" />
                    <path d={`M0 40 ${sparkPath(s.chart).replace(/M/, "L")} L122 40 Z`} fill="#fed7aa" opacity="0.45" />
                  </svg>
                </div>
              )}

              {idx === 3 && (
                <div className="mt-4 space-y-2">
                  {[0.86, 0.72, 0.55].map((r, i) => (
                    <div key={i} className="h-2 rounded-full bg-slate-200/80">
                      <div
                        className="h-2 rounded-full bg-linear-to-r from-cyan-500 to-brand-500"
                        style={{ width: `${Math.round(r * 100)}%`, opacity: 1 - i * 0.18 }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative mt-2 flex items-center justify-between text-[11px] text-slate-500">
              <span>Updated now</span>
              <span className="mono uppercase tracking-[0.12em]">Chart</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-linear-to-r from-fuchsia-700 via-fuchsia-600 to-violet-500 p-5 text-white shadow-lg shadow-fuchsia-700/20">
        <div className="flex items-start gap-3">
          <div className="mt-1 flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-lg font-semibold">Automatic monthly folders</p>
            <p className="mt-1 text-sm text-white/90">
              {months} monthly folders are live. Next sync scheduled for Oct 31, 23:59 UTC.
            </p>
          </div>
        </div>
        <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-fuchsia-700 transition hover:bg-fuchsia-50">
          View Schedule
        </button>
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-3xl font-bold tracking-tight text-[#1f2640]">Fleet</h3>
          <div className="flex items-center gap-2">
            <button className="mono text-xs font-semibold uppercase tracking-[0.16em] text-brand-700 transition hover:text-brand-900">
              View All
            </button>
            <button
              onClick={onNewVessel}
              className="rounded-lg bg-brand-700 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-600"
            >
              New Vessel
            </button>
          </div>
        </div>

        {vessels.length === 0 ? (
          <div className="rounded-2xl border border-slate-300 bg-white/85 p-6 text-sm text-slate-500">
            No vessels yet. Add your first vessel.
          </div>
        ) : (
          <div className="space-y-3">
            {vessels.slice(0, 4).map((v, i) => (
              <button
                key={v.id}
                onClick={() => onOpenVessel(v)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-300/80 bg-white/90 p-3 text-left transition hover:border-brand-300 hover:bg-white"
              >
                <span className="h-12 w-12 rounded-xl bg-linear-to-br from-slate-700 via-slate-600 to-slate-500" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-slate-800">{v.name}</span>
                  <span className="mono text-[10px] uppercase tracking-[0.16em] text-slate-500">
                    IMO {v.imo ?? "unknown"}
                  </span>
                </span>
                <span className={"mono text-[10px] font-semibold uppercase tracking-[0.15em] " + (i === vessels.length - 1 ? "text-rose-600" : "text-brand-700")}>
                  {i === vessels.length - 1 ? "offline" : "active"}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <ChartNoAxesColumn className="h-5 w-5 text-slate-500" />
          <h3 className="text-4xl font-bold tracking-tight text-[#1f2640]">Main Folders</h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
          {tree.map((m) => {
            const accent = MAIN_ACCENTS[m.name];
            const imageUrl = MAIN_FOLDER_IMAGES[m.name] ?? "/images/folders/insurance.svg";
            return (
              <button
                key={m.id}
                onClick={() => onOpenMain(m)}
                className="group relative overflow-hidden rounded-3xl border border-white/80 bg-linear-to-br from-white/92 to-[#f7f5ff]/85 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/70" />
                <div
                  className="h-24 bg-cover bg-center"
                  style={{ backgroundImage: `linear-gradient(to top, rgba(12, 20, 35, 0.45), rgba(12, 20, 35, 0.1)), url(${imageUrl})` }}
                />
                <div className="px-4 py-4">
                  <span
                    className={
                      "mono inline-flex items-center rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] " +
                      (accent ? `${accent.chip} ${accent.text}` : "bg-slate-100 text-slate-700")
                    }
                  >
                    {m.name.split(" ")[0]}
                  </span>
                  <p className="line-clamp-2 min-h-[3.75rem] mt-3 text-2xl font-bold tracking-tight text-slate-900">{m.name}</p>
                  <p className="mt-2 text-xs text-slate-500">{m.children?.length ?? 0} folders</p>

                  <div className="mt-3 h-1.5 rounded-full bg-white/85 ring-1 ring-slate-200/70">
                    <div className="h-1.5 rounded-full bg-linear-to-r from-brand-500 to-cyan-400" style={{ width: "68%" }} />
                  </div>

                  <div className="mt-4 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="mono uppercase tracking-[0.12em]">Structured</span>
                    <div className="flex items-center gap-2 text-slate-500 transition group-hover:text-brand-700">
                      <span className="mono text-[10px] uppercase tracking-[0.12em]">Open</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="hidden">{monthDriven}</div>
    </div>
  );
}

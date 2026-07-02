import { useState } from "react";
import { Anchor, LayoutDashboard, Layers, Plus, LogOut, MonitorX, AlertTriangle } from "lucide-react";
import type { FolderNode } from "../api";
import { MAIN_ACCENTS } from "./nodeStyle";

interface Props {
  mains: FolderNode[];
  view: "dashboard" | "explorer";
  selectedMainId: string | null;
  onSelectMain: (node: FolderNode) => void;
  onDashboard: () => void;
  onNewVessel: () => void;
  /** Sign out of this app session only */
  onSignOut: () => void;
  /** Sign out of ALL Microsoft accounts on the device */
  onGlobalSignOut: () => void;
}

export function Sidebar({
  mains,
  view,
  selectedMainId,
  onSelectMain,
  onDashboard,
  onNewVessel,
  onSignOut,
  onGlobalSignOut,
}: Props) {
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  return (
    <aside className="flex h-full w-72 shrink-0 flex-col bg-navy-900 text-slate-200">
      <button
        onClick={onDashboard}
        className="flex items-center gap-3 px-5 py-5 text-left transition hover:bg-white/5"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 ring-1 ring-brand-400/30">
          <Anchor className="h-5 w-5 text-brand-300" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-tight text-white">
            Vessel DMS
          </h1>
          <p className="text-[11px] text-slate-400">SharePoint Embedded</p>
        </div>
      </button>

      <div className="px-4 pb-3">
        <button
          onClick={onNewVessel}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-brand-500"
        >
          <Plus className="h-4 w-4" />
          New Vessel
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
        <button
          onClick={onDashboard}
          className={
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition " +
            (view === "dashboard"
              ? "bg-white/10 font-medium text-white"
              : "text-slate-300 hover:bg-white/5")
          }
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10">
            <LayoutDashboard className="h-4 w-4 text-brand-300" />
          </span>
          Dashboard
        </button>

        <p className="px-2 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          Main Folders
        </p>

        {mains.map((m) => {
          const accent = MAIN_ACCENTS[m.name];
          const active = view === "explorer" && selectedMainId === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onSelectMain(m)}
              className={
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition " +
                (active
                  ? "bg-white/10 font-medium text-white"
                  : "text-slate-300 hover:bg-white/5")
              }
            >
              <span
                className={
                  "flex h-7 w-7 items-center justify-center rounded-lg " +
                  (accent ? accent.chip : "bg-white/10")
                }
              >
                <Layers
                  className={"h-4 w-4 " + (accent ? accent.text : "text-white")}
                />
              </span>
              <span className="truncate text-left">{m.name}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/5 p-4 flex flex-col gap-2">
        <button
          onClick={() => setShowSignOutModal(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/20 cursor-pointer"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign Out
        </button>
        <div className="text-[11px] text-slate-500 text-center">
          UI preview · stub data
        </div>
      </div>

      {/* ── Sign-out chooser modal ───────────────────────────────────────── */}
      {showSignOutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setShowSignOutModal(false)}
        >
          <div
            className="relative mx-4 w-full max-w-sm rounded-2xl bg-white shadow-2xl shadow-black/20 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 ring-1 ring-rose-100">
                <LogOut className="h-5 w-5 text-rose-500" />
              </span>
              <div>
                <h3 className="text-base font-semibold text-slate-800">Sign Out</h3>
                <p className="text-[11px] text-slate-400">Choose how you want to sign out</p>
              </div>
            </div>

            {/* Option 1 — this app only */}
            <button
              onClick={() => { setShowSignOutModal(false); onSignOut(); }}
              className="w-full flex items-start gap-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 px-4 py-3.5 text-left transition mb-3 cursor-pointer group"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-100 group-hover:bg-violet-200 transition">
                <LogOut className="h-4 w-4 text-violet-600" />
              </span>
              <div>
                <span className="block text-sm font-semibold text-slate-800">Sign out of this app</span>
                <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">
                  Ends your current session. Other Microsoft apps
                  on this device stay signed in.
                </span>
              </div>
            </button>

            {/* Option 2 — all accounts / all devices */}
            <button
              onClick={() => { setShowSignOutModal(false); onGlobalSignOut(); }}
              className="w-full flex items-start gap-3.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 hover:border-rose-300 px-4 py-3.5 text-left transition cursor-pointer group"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-100 group-hover:bg-rose-200 transition">
                <MonitorX className="h-4 w-4 text-rose-600" />
              </span>
              <div>
                <span className="block text-sm font-semibold text-rose-700">Sign out of all accounts</span>
                <span className="block text-xs text-rose-500 mt-0.5 leading-relaxed">
                  Ends every active Microsoft session across all
                  organisations on this device.
                </span>
              </div>
            </button>

            {/* Warning note */}
            <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 px-3 py-2.5">
              <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
              <p className="text-[11px] text-amber-700 leading-relaxed">
                "Sign out of all accounts" will also sign you out of Teams,
                Outlook, and any other app using Microsoft authentication.
              </p>
            </div>

            {/* Cancel */}
            <button
              onClick={() => setShowSignOutModal(false)}
              className="mt-3 w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

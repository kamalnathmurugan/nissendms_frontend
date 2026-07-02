import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Bell,
  Eye,
  Filter,
  Grid2x2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import {
  createVessel,
  deleteFile,
  fileContentUrl,
  getJob,
  getTree,
  listVessels,
  monthUpload,
  uploadFile,
  type FolderNode,
  type SearchResult,
  type Vessel,
} from "./api";
import { Sidebar } from "./components/Sidebar";
import { CreateVesselModal } from "./components/CreateVesselModal";
import { Breadcrumb, type Crumb } from "./components/Breadcrumb";
import { UploadControl } from "./components/UploadControl";
import { ToastStack, type ToastItem } from "./components/Toast";
import { Dashboard } from "./components/Dashboard";
import { SearchBar } from "./components/SearchBar";
import { MAIN_ACCENTS, iconFor } from "./components/nodeStyle";

function errDetail(e: unknown, fallback: string): string {
  return (
    (e as { response?: { data?: { detail?: string } } })?.response?.data
      ?.detail ?? fallback
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function indexTree(tree: FolderNode[]): Map<string, FolderNode> {
  const map = new Map<string, FolderNode>();
  const walk = (n: FolderNode) => {
    map.set(n.id, n);
    n.children?.forEach(walk);
  };
  tree.forEach(walk);
  return map;
}

export default function App() {
  const [tree, setTree] = useState<FolderNode[]>([]);
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [view, setView] = useState<"dashboard" | "explorer">("dashboard");
  const [path, setPath] = useState<string[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [loading, setLoading] = useState(true);

  const index = useMemo(() => indexTree(tree), [tree]);

  const refresh = useCallback(async () => {
    const [t, v] = await Promise.all([getTree(), listVessels()]);
    setTree(t);
    setVessels(v);
    setLoading(false);
    return { tree: t, vessels: v };
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const currentId = path.length ? path[path.length - 1] : null;
  const current = currentId ? index.get(currentId) ?? null : null;
  const children = current ? (current.children ?? []) : tree;

  const goDashboard = () => setView("dashboard");
  const openMain = (node: FolderNode) => {
    setView("explorer");
    setPath([node.id]);
  };
  const openChild = (node: FolderNode) => {
    if (node.kind === "file") return;
    setPath((p) => [...p, node.id]);
  };
  const crumbTo = (i: number) => {
    setPath((p) => p.slice(0, i + 1));
  };

  const crumbs: Crumb[] = useMemo(() => {
    const list: Crumb[] = [];
    for (const id of path) {
      const n = index.get(id);
      if (n) list.push({ id, name: n.name });
    }
    return list;
  }, [path, index]);

  const upsertToast = (t: ToastItem) =>
    setToasts((prev) => {
      const i = prev.findIndex((x) => x.id === t.id);
      if (i === -1) return [...prev, t];
      const copy = [...prev];
      copy[i] = t;
      return copy;
    });

  const dismissToast = (id: number) =>
    setToasts((prev) => prev.filter((t) => t.id !== id));

  const handleUpload = useCallback(
    async (node: FolderNode, file: File, category?: string) => {
      const id = Date.now() + Math.floor(Math.random() * 1000);
      upsertToast({
        id,
        status: "processing",
        title: `Uploading ${file.name}`,
        detail: node.month_driven
          ? "Detecting month from document..."
          : `to ${node.name}`,
      });
      try {
        const job = node.month_driven
          ? await monthUpload(node.id, file, category)
          : await uploadFile(node.id, file);
        let final = job;
        for (let i = 0; i < 8 && final.status === "processing"; i++) {
          await sleep(400);
          final = await getJob(job.id);
        }
        upsertToast({
          id,
          status: final.status,
          title: final.status === "done" ? "Uploaded & filed" : "Upload failed",
          detail: final.destination,
          detectedMonth: final.detected_month,
        });
        await refresh();
        setTimeout(() => dismissToast(id), 6000);
      } catch (e) {
        upsertToast({
          id,
          status: "failed",
          title: "Upload failed",
          detail: errDetail(e, file.name),
        });
        setTimeout(() => dismissToast(id), 6000);
      }
    },
    [refresh]
  );

  const handleDelete = useCallback(
    async (node: FolderNode) => {
      if (!window.confirm(`Delete "${node.name}"? This cannot be undone.`)) return;
      const id = Date.now() + Math.floor(Math.random() * 1000);
      try {
        await deleteFile(node.id);
        await refresh();
        upsertToast({ id, status: "done", title: "Deleted", detail: node.name });
      } catch (e) {
        upsertToast({
          id,
          status: "failed",
          title: "Delete failed",
          detail: errDetail(e, node.name),
        });
      }
      setTimeout(() => dismissToast(id), 5000);
    },
    [refresh]
  );

  const navigateToResult = (r: SearchResult) => {
    setView("explorer");
    const ids = r.trail.map((t) => t.id);
    if (r.kind === "file") ids.pop();
    setPath(ids);
  };

  const handleCreate = async (name: string, imo: string) => {
    const vesselName = name.trim();
    await createVessel(vesselName, imo || undefined);
    const data = await refresh();

    const id = Date.now() + Math.floor(Math.random() * 1000);
    upsertToast({
      id,
      status: "done",
      title: "Vessel created",
      detail: `${vesselName} was provisioned under all 3 main folders.`,
    });
    setTimeout(() => dismissToast(id), 5000);

    if (data.tree[0]?.id) {
      setView("explorer");
      setPath([data.tree[0].id]);
    }
  };

  const handleOpenVessel = useCallback(
    (vessel: Vessel) => {
      // Find this vessel under the main folders and open the first matching branch.
      for (const main of tree) {
        const shipNode = (main.children ?? []).find(
          (n) => n.kind === "ship" && n.name.toLowerCase() === vessel.name.toLowerCase()
        );
        if (shipNode) {
          setView("explorer");
          setPath([main.id, shipNode.id]);
          return;
        }
      }

      const id = Date.now() + Math.floor(Math.random() * 1000);
      upsertToast({
        id,
        status: "failed",
        title: "Vessel folders not found",
        detail: `Could not locate ${vessel.name} under the main folders yet.`,
      });
      setTimeout(() => dismissToast(id), 5000);
    },
    [tree]
  );

  const mainName = path.length ? index.get(path[0])?.name : undefined;
  const accent = (mainName && MAIN_ACCENTS[mainName]) || MAIN_ACCENTS["Insurance"];
  const canUpload = !!current && (current.upload || current.month_driven);

  return (
    <div className="flex h-screen overflow-hidden text-ink">
      <Sidebar
        mains={tree}
        view={view}
        selectedMainId={path[0] ?? null}
        onDashboard={goDashboard}
        onSelectMain={openMain}
        onNewVessel={() => setShowModal(true)}
      />

      <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-300/70 bg-white/70 px-4 py-3 backdrop-blur">
          <SearchBar onNavigate={navigateToResult} />
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-300 bg-white p-2 text-slate-600 transition hover:border-slate-400">
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2.5 py-1.5">
              <span className="mono hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 lg:block">
                Capt. Elias Vance
              </span>
              <span className="h-7 w-7 rounded-full bg-linear-to-br from-cyan-600 to-brand-700" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[linear-gradient(180deg,#f6f5fc_0%,#f1effa_100%)] py-6">
          {view === "dashboard" ? (
            loading ? (
              <p className="text-sm text-slate-500">Loading dashboard...</p>
            ) : (
              <Dashboard
                vessels={vessels}
                tree={tree}
                onOpenMain={openMain}
                onOpenVessel={handleOpenVessel}
                onNewVessel={() => setShowModal(true)}
              />
            )
          ) : (
            <ExplorerPane
              loading={loading}
              current={current}
              children={children}
              crumbs={crumbs}
              canUpload={canUpload}
              accent={accent}
              onNavigateCrumb={crumbTo}
              onOpenChild={openChild}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          )}
        </div>
      </main>

      {showModal && (
        <CreateVesselModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

function ExplorerPane({
  loading,
  current,
  children,
  crumbs,
  canUpload,
  accent,
  onNavigateCrumb,
  onOpenChild,
  onUpload,
  onDelete,
}: {
  loading: boolean;
  current: FolderNode | null;
  children: FolderNode[];
  crumbs: Crumb[];
  canUpload: boolean;
  accent: (typeof MAIN_ACCENTS)[string];
  onNavigateCrumb: (i: number) => void;
  onOpenChild: (n: FolderNode) => void;
  onUpload: (node: FolderNode, file: File, category?: string) => void;
  onDelete: (n: FolderNode) => void;
}) {
  const folderItems = children.filter((i) => i.kind !== "file");
  const fileItems = children.filter((i) => i.kind === "file");

  return (
    <div className="w-full space-y-5 px-2 md:px-3">
      <div className="rounded-2xl border border-white/70 bg-linear-to-r from-white/85 via-[#f8f6ff]/85 to-white/80 px-5 py-3 shadow-sm">
        <Breadcrumb crumbs={crumbs} onNavigate={onNavigateCrumb} />
      </div>

      <header className="relative overflow-hidden rounded-3xl border border-white/75 bg-linear-to-r from-white/85 via-[#f8f6ff]/85 to-white/85 px-6 py-5 shadow-sm">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-linear-to-br from-cyan-100/60 to-brand-100/10" />
        <div className="pointer-events-none absolute -left-6 bottom-0 h-12 w-36 rounded-t-full bg-white/60" />
        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mono mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-brand-700">
              Explorer
            </p>
          <h2 className="text-5xl font-extrabold tracking-tight text-ink">
            {current?.name ?? "Browse"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {current
              ? `${children.length} items in this folder.`
              : "Select a main folder to begin exploring documents."}
          </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-brand-300 hover:bg-white">
              <Filter className="h-4 w-4" />
              Filter
            </button>
            {canUpload && current && (
              <UploadControl node={current} onUpload={onUpload} variant="primary" />
            )}
          </div>
        </div>
      </header>

      {loading ? (
        <p className="text-sm text-slate-500">Loading explorer...</p>
      ) : !current ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-500">
          Open a main folder from the left panel to start.
        </div>
      ) : (
        <>
          <section>
            <div className="mb-2 flex items-center justify-between">
              <p className="mono text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Active Vessels
              </p>
              <div className="flex items-center gap-1">
                <button className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-500">
                  <Grid2x2 className="h-4 w-4" />
                </button>
                <button className="rounded-lg border border-slate-300 bg-white p-1.5 text-slate-500">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            </div>

            {folderItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white/80 p-6 text-sm text-slate-500">
                This folder has no child folders yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {folderItems.map((n) => (
                  <FolderTile key={n.id} node={n} accent={accent} onOpen={onOpenChild} />
                ))}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/75 bg-linear-to-b from-white/90 to-[#f8f6ff]/80 shadow-sm">
            <div className="border-b border-slate-200/80 px-5 py-3">
              <p className="mono text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">
                Recent Documents
              </p>
            </div>
            {fileItems.length === 0 ? (
              <p className="px-5 py-8 text-sm text-slate-500">No files in this folder yet.</p>
            ) : (
              <DocumentTable files={fileItems} onDelete={onDelete} />
            )}
          </section>
        </>
      )}
    </div>
  );
}

function FolderTile({
  node,
  accent,
  onOpen,
}: {
  node: FolderNode;
  accent: (typeof MAIN_ACCENTS)[string];
  onOpen: (n: FolderNode) => void;
}) {
  const { Icon, cls } = iconFor(node);
  const typeLabel =
    node.kind === "ship"
      ? "Vessel"
      : node.month_driven
        ? "Auto Month"
        : node.kind === "month"
          ? "Monthly"
          : "Folder";

  return (
    <button
      onClick={() => onOpen(node)}
      className="group relative overflow-hidden rounded-3xl border border-white/80 bg-linear-to-br from-white/92 to-[#f7f5ff]/85 p-4 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md"
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/70" />
      <div className="pointer-events-none absolute -left-8 -bottom-8 h-20 w-20 rounded-full bg-white/55" />

      <div className="mb-4 flex items-start justify-between">
        <span className={"flex h-12 w-12 items-center justify-center rounded-2xl ring-1 ring-black/5 " + accent.chip}>
          <Icon className={"h-6 w-6 " + cls} />
        </span>
        <span className="mono rounded-full border border-slate-200 bg-white/85 px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
          {typeLabel}
        </span>
      </div>
      <p className="line-clamp-2 min-h-[4.25rem] text-3xl font-bold tracking-tight text-[#1d243d]">{node.name}</p>
      <p className="mt-1 text-sm text-slate-500">{node.children?.length ?? 0} files and folders</p>

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
    </button>
  );
}

function DocumentTable({
  files,
  onDelete,
}: {
  files: FolderNode[];
  onDelete: (n: FolderNode) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-180 text-left">
        <thead>
          <tr className="mono text-[11px] uppercase tracking-[0.15em] text-slate-500">
            <th className="px-5 py-3">Name</th>
            <th className="px-5 py-3">Date Modified</th>
            <th className="px-5 py-3">Type</th>
            <th className="px-5 py-3">Status</th>
            <th className="px-5 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200/80">
          {files.map((f, i) => (
            <tr key={f.id} className="text-sm text-slate-700 transition hover:bg-white/60">
              <td className="px-5 py-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-[11px] font-semibold text-rose-700">
                    {(f.ext ?? "doc").toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-slate-800">{f.name}</p>
                    <p className="text-xs text-slate-500">Maritime Registry</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3 text-slate-600">{i === 0 ? "Oct 12, 2023" : i === 1 ? "Oct 11, 2023" : "Yesterday"}</td>
              <td className="px-5 py-3">
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600">Technical</span>
              </td>
              <td className="px-5 py-3">
                <span className={"inline-flex items-center gap-2 text-xs font-medium " + (i === 1 ? "text-orange-600" : i === 2 ? "text-fuchsia-700" : "text-brand-700")}>
                  <span className={"h-2 w-2 rounded-full " + (i === 1 ? "bg-orange-500" : i === 2 ? "bg-fuchsia-500" : "bg-brand-600")} />
                  {i === 1 ? "Reviewing" : i === 2 ? "Signed" : "Verified"}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex justify-end gap-1">
                  <a
                    href={fileContentUrl(f.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-brand-700"
                    title="View"
                  >
                    <Eye className="h-4 w-4" />
                  </a>
                  <a
                    href={fileContentUrl(f.id)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                    title="Download"
                  >
                    <ArrowDownToLine className="h-4 w-4" />
                  </a>
                  <button
                    onClick={() => onDelete(f)}
                    className="rounded-lg p-2 text-slate-500 transition hover:bg-rose-50 hover:text-rose-700"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

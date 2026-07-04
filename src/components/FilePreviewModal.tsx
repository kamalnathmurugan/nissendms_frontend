import { X } from "lucide-react";
import { FolderNode, fileContentUrl } from "../api";

interface Props {
  file: FolderNode;
  onClose: () => void;
}

export function FilePreviewModal({ file, onClose }: Props) {
  const url = fileContentUrl(file.id) + "?preview=true";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="flex h-[90vh] w-full max-w-6xl flex-col rounded-3xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
              {(file.ext ?? "doc").toUpperCase()}
            </span>
            <div>
              <h2 className="text-base font-semibold text-slate-800 line-clamp-1">
                {file.name}
              </h2>
              <p className="text-xs text-slate-500">Document Preview</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Viewport Frame */}
        <div className="relative flex-1 bg-slate-100">
          <iframe
            src={url}
            title={file.name}
            className="h-full w-full border-none"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  );
}

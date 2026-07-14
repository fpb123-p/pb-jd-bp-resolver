import { useEffect } from "react";
import {
  X,
  History as HistoryIcon,
  RotateCw,
  Trash2,
  Copy,
  ShoppingBag,
} from "lucide-react";
import { useResolveStore, type ResolveRecord } from "@/store/useResolveStore";

function formatDate(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getMonth() + 1}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function truncate(s: string, n: number): string {
  if (!s) return "";
  return s.length > n ? s.slice(0, n) + "…" : s;
}

export default function HistoryDrawer() {
  const open = useResolveStore((s) => s.historyOpen);
  const setOpen = useResolveStore((s) => s.setHistoryOpen);
  const history = useResolveStore((s) => s.history);
  const loadHistory = useResolveStore((s) => s.loadHistory);
  const removeHistory = useResolveStore((s) => s.removeHistory);
  const clearHistory = useResolveStore((s) => s.clearHistory);
  const applyHistory = useResolveStore((s) => s.applyHistory);

  useEffect(() => {
    if (open && history.length === 0) loadHistory();
  }, [open, history.length, loadHistory]);

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/50 transition-opacity duration-200 ${open ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l-2 border-ink bg-paper transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"
          }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b-2 border-ink px-5 py-4">
          <div className="flex items-center gap-2">
            <span className="stamp-tag bg-acid">
              <HistoryIcon size={12} strokeWidth={3} />
              <span>HISTORY</span>
            </span>
            <h2 className="font-display text-lg">解析历史</h2>
            <span className="text-xs text-muted">({history.length})</span>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="grid h-8 w-8 place-items-center border-2 border-ink hover:bg-jd-red hover:text-paper transition-colors"
            aria-label="关闭"
          >
            <X size={16} strokeWidth={2.5} />
          </button>
        </div>

        {history.length > 0 && (
          <div className="flex items-center justify-between border-b-2 border-dashed border-ink/30 px-5 py-2">
            <button
              type="button"
              onClick={loadHistory}
              className="inline-flex items-center gap-1 text-xs text-muted hover:text-ink"
            >
              <RotateCw size={11} strokeWidth={2.5} /> 刷新
            </button>
            <button
              type="button"
              onClick={() => {
                if (confirm("确定清空所有历史记录？")) clearHistory();
              }}
              className="inline-flex items-center gap-1 text-xs text-jd-red hover:underline"
            >
              <Trash2 size={11} strokeWidth={2.5} /> 清空全部
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {history.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-muted">
              <HistoryIcon size={40} strokeWidth={1.2} />
              <p className="text-sm">还没有历史记录</p>
              <p className="text-xs">每次成功解析后会自动保存到这里</p>
            </div>
          ) : (
            <ul className="space-y-3">
              {history.map((rec) => (
                <HistoryItem
                  key={rec.id}
                  rec={rec}
                  onApply={() => applyHistory(rec)}
                  onRemove={() => removeHistory(rec.id)}
                />
              ))}
            </ul>
          )}
        </div>

        <div className="border-t-2 border-ink px-5 py-3 text-[11px] text-muted">
          数据仅保存在本机浏览器
        </div>
      </aside>
    </>
  );
}

function HistoryItem({
  rec,
  onApply,
  onRemove,
}: {
  rec: ResolveRecord;
  onApply: () => void;
  onRemove: () => void;
}) {
  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(rec.commlist);
    } catch {
      // ignore
    }
  };

  return (
    <li
      onClick={onApply}
      className="press-card-flat group cursor-pointer p-3 transition-all hover:shadow-hard-sm"
    >
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted">
          {formatDate(rec.createdAt)}
        </span>
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            type="button"
            onClick={handleCopy}
            className="grid h-6 w-6 place-items-center border border-ink hover:bg-acid"
            title="复制 commlist"
          >
            <Copy size={11} strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="grid h-6 w-6 place-items-center border border-ink hover:bg-jd-red hover:text-paper"
            title="删除"
          >
            <Trash2 size={11} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      <div className="mb-2 flex items-center gap-2 text-xs">
        <span className="inline-flex items-center gap-1 bg-ink px-1.5 py-0.5 font-mono text-[10px] text-paper">
          <ShoppingBag size={10} strokeWidth={3} />
          {rec.skuId}
        </span>
        <span className="truncate font-mono text-[11px] text-muted">
          {truncate(rec.sourceLink, 30)}
        </span>
      </div>

      <p className="break-all font-mono text-[11px] leading-relaxed text-ink-soft">
        {truncate(rec.commlist, 80)}
      </p>
    </li>
  );
}

import { History, ShoppingBag } from "lucide-react";
import { useResolveStore } from "@/store/useResolveStore";

export default function Header() {
  const history = useResolveStore((s) => s.history);
  const setHistoryOpen = useResolveStore((s) => s.setHistoryOpen);

  return (
    <header className="relative border-b-2 border-ink">
      <div className="ticker-strip h-2 w-full" />

      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-8">
        <div className="flex items-center gap-3">
          <div className="press-card-flat grid h-12 w-12 place-items-center bg-jd-red text-paper">
            <ShoppingBag size={22} strokeWidth={2.5} />
          </div>
          <div className="leading-tight">
            <h1 className="font-display text-xl md:text-2xl">pb · BP 反解工坊</h1>
            <p className="text-[11px] uppercase tracking-[0.3em] text-muted">
              JD BP · COMMLIST RESOLVER
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:block stamp-tag bg-acid">
            <span>短链转结算链接</span>
          </div>
          <button
            type="button"
            onClick={() => setHistoryOpen(true)}
            className="btn-ghost text-sm"
          >
            <History size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">历史</span>
            <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center bg-ink px-1 text-[11px] text-paper">
              {history.length}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

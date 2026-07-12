import { create } from "zustand";

const HISTORY_KEY = "jd_bp_resolve_history";
const HISTORY_LIMIT = 20;

export interface ResolveRecord {
  id: string;
  sourceText: string;
  sourceLink: string;
  finalUrl: string;
  skuId: string;
  commlist: string;
  createdAt: number;
}

interface ResolveState {
  /** 用户输入的 bp 文案 */
  input: string;
  /** 是否正在解析中 */
  loading: boolean;
  /** 最近一次解析结果 */
  result: ResolveResponse | null;
  /** 历史记录 */
  history: ResolveRecord[];
  /** 历史抽屉是否打开 */
  historyOpen: boolean;

  setInput: (v: string) => void;
  setLoading: (v: boolean) => void;
  setResult: (r: ResolveResponse | null) => void;
  setHistoryOpen: (v: boolean) => void;

  loadHistory: () => void;
  addHistory: (rec: Omit<ResolveRecord, "id" | "createdAt">) => void;
  removeHistory: (id: string) => void;
  clearHistory: () => void;
  applyHistory: (rec: ResolveRecord) => void;
  resetForm: () => void;
}

interface ResolveResponse {
  ok: boolean;
  sourceLink?: string;
  finalUrl?: string;
  skuId?: string | null;
  commlist?: string | null;
  error?: string;
}

function readHistory(): ResolveRecord[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

function writeHistory(list: ResolveRecord[]) {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, HISTORY_LIMIT)));
  } catch {
    // ignore
  }
}

function uuid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const useResolveStore = create<ResolveState>((set, get) => ({
  input: "",
  loading: false,
  result: null,
  history: [],
  historyOpen: false,

  setInput: (v) => set({ input: v }),
  setLoading: (v) => set({ loading: v }),
  setResult: (r) => set({ result: r }),
  setHistoryOpen: (v) => set({ historyOpen: v }),

  loadHistory: () => set({ history: readHistory() }),

  addHistory: (rec) => {
    const record: ResolveRecord = {
      ...rec,
      id: uuid(),
      createdAt: Date.now(),
    };
    const next = [record, ...get().history].slice(0, HISTORY_LIMIT);
    writeHistory(next);
    set({ history: next });
  },

  removeHistory: (id) => {
    const next = get().history.filter((h) => h.id !== id);
    writeHistory(next);
    set({ history: next });
  },

  clearHistory: () => {
    writeHistory([]);
    set({ history: [] });
  },

  applyHistory: (rec) =>
    set({
      input: rec.sourceText,
      result: {
        ok: true,
        sourceLink: rec.sourceLink,
        finalUrl: rec.finalUrl,
        skuId: rec.skuId,
        commlist: rec.commlist,
      },
      historyOpen: false,
    }),

  resetForm: () => set({ input: "", result: null }),
}));

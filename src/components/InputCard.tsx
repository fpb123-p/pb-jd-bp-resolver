import { ClipboardPaste, FileText, X, Zap, Loader2 } from "lucide-react";
import { useResolveStore } from "@/store/useResolveStore";
import { resolveBpText } from "@/lib/api";

export default function InputCard() {
  const input = useResolveStore((s) => s.input);
  const setInput = useResolveStore((s) => s.setInput);
  const loading = useResolveStore((s) => s.loading);
  const setLoading = useResolveStore((s) => s.setLoading);
  const setResult = useResolveStore((s) => s.setResult);
  const addHistory = useResolveStore((s) => s.addHistory);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInput(text.trim());
    } catch {
      // 权限被拒绝
    }
  };

  const handleResolve = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await resolveBpText(input);
      setResult(res);

      // 成功则保存到历史
      if (res.ok && res.commlist && res.skuId) {
        addHistory({
          sourceText: input,
          sourceLink: res.sourceLink || "",
          finalUrl: res.finalUrl || "",
          skuId: res.skuId,
          commlist: res.commlist,
        });
      }
    } catch (err) {
      setResult({
        ok: false,
        error: (err as Error).message || "请求失败",
      });
    } finally {
      setLoading(false);
    }
  };

  const canResolve = !!input.trim() && !loading;

  return (
    <section className="press-card grain p-5 md:p-6 animate-rise">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="stamp-tag bg-ink text-paper">
            <FileText size={12} strokeWidth={3} />
            <span>STEP 01</span>
          </span>
          <h2 className="font-display text-lg md:text-xl">粘贴 bp 文案</h2>
        </div>
        {input && (
          <button
            type="button"
            onClick={() => setInput("")}
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-jd-red"
          >
            <X size={12} /> 清空
          </button>
        )}
      </div>

      <div className="relative">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`【京东】 \`https://u.jd.com/X659fJ0\`  CA1393 「instax mini双白相纸」\n点击链接直接打开 或者复制文案打开京东\n\n————————\n更多好物推荐：\`https://u.jd.com/XgeY8Qd\``}
          rows={8}
          className="input-hard font-mono text-sm resize-y"
          spellCheck={false}
        />
        <button
          type="button"
          onClick={handlePaste}
          className="absolute right-2 top-2 btn-acid text-xs px-3 py-1.5"
        >
          <ClipboardPaste size={14} strokeWidth={2.5} />
          粘贴
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleResolve}
          disabled={!canResolve}
          className={loading ? "btn-ghost" : "btn-red"}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />
              解析中…
            </>
          ) : (
            <>
              <Zap size={16} strokeWidth={2.5} />
              解析生成 commlist
            </>
          )}
        </button>
        <p className="text-[11px] text-muted">
          工具会提取文案中<b className="text-ink">第一个</b>京东链接并解析
        </p>
      </div>
    </section>
  );
}

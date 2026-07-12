import { useState } from "react";
import {
  Copy,
  Check,
  ShoppingBag,
  AlertCircle,
  Link2,
  ArrowRight,
  Hash,
  ExternalLink,
} from "lucide-react";
import { useResolveStore } from "@/store/useResolveStore";

export default function ResultPanel() {
  const result = useResolveStore((s) => s.result);
  const loading = useResolveStore((s) => s.loading);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!result?.commlist) return;
    try {
      await navigator.clipboard.writeText(result.commlist);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // 兜底
      const ta = document.createElement("textarea");
      ta.value = result.commlist;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch {
        // ignore
      }
      document.body.removeChild(ta);
    }
  };

  return (
    <section className="press-card grain sticky top-6 p-5 md:p-6 animate-rise">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="stamp-tag bg-jd-red text-paper">
            <ShoppingBag size={12} strokeWidth={3} />
            <span>OUTPUT</span>
          </span>
          <h2 className="font-display text-lg md:text-xl">结算链接</h2>
        </div>
        {result?.ok && result.commlist && (
          <a
            href={result.commlist}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted hover:text-jd-red"
          >
            <ExternalLink size={12} strokeWidth={2.5} />
            打开
          </a>
        )}
      </div>

      {/* 空状态 */}
      {!result && !loading && (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-muted">
          <ShoppingBag size={40} strokeWidth={1.2} />
          <p className="text-sm">解析结果将显示在这里</p>
          <p className="text-xs">粘贴 bp 文案后点击「解析生成 commlist」</p>
        </div>
      )}

      {/* 加载状态 */}
      {loading && (
        <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 text-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink border-t-jd-red" />
          <p className="text-sm">正在解析短链…</p>
          <p className="text-xs">后端请求京东服务器跟随 302 跳转</p>
        </div>
      )}

      {/* 错误 */}
      {result && !result.ok && (
        <div className="flex min-h-[280px] flex-col items-start gap-4">
          <div className="flex w-full items-center gap-3 border-2 border-jd-red bg-jd-red/10 p-4">
            <AlertCircle size={24} strokeWidth={2.5} className="shrink-0 text-jd-red" />
            <div>
              <p className="font-bold text-jd-red">解析失败</p>
              <p className="text-sm text-ink-soft">{result.error}</p>
            </div>
          </div>
          {result.sourceLink && (
            <div className="w-full">
              <div className="mb-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                已识别链接
              </div>
              <code className="block break-all bg-paper border-2 border-ink p-3 font-mono text-xs">
                {result.sourceLink}
              </code>
            </div>
          )}
        </div>
      )}

      {/* 成功结果 */}
      {result?.ok && result.commlist && (
        <div className="space-y-4">
          {/* 解析链路 */}
          <div className="space-y-2">
            <StepRow
              icon={<Link2 size={12} strokeWidth={2.5} />}
              label="源链接"
              value={result.sourceLink || ""}
            />
            <div className="ml-3 flex items-center gap-1 text-[11px] text-muted">
              <ArrowRight size={10} />
              <span>跟随 302 跳转</span>
            </div>
            <StepRow
              icon={<ExternalLink size={12} strokeWidth={2.5} />}
              label="最终 URL"
              value={result.finalUrl || ""}
            />
            <div className="ml-3 flex items-center gap-1 text-[11px] text-muted">
              <ArrowRight size={10} />
              <span>提取 SKU</span>
            </div>
            <StepRow
              icon={<Hash size={12} strokeWidth={2.5} />}
              label="SKU ID"
              value={result.skuId || ""}
              highlight
            />
          </div>

          <div className="dashed-rule" />

          {/* commlist 输出 */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="stamp-tag bg-acid">COMMLIST 链接</span>
              <span className="font-mono text-[11px] text-muted">
                {result.commlist.length} 字符
              </span>
            </div>
            <div
              id="commlist-output"
              className="relative min-h-[80px] break-all border-2 border-ink bg-paper p-4 font-mono text-[13px] leading-relaxed"
            >
              {result.commlist}
              <span className="animate-stamp pointer-events-none absolute right-3 top-3 rotate-[-3deg] select-none border-2 border-jd-red bg-paper px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-jd-red">
                ready
              </span>
            </div>
          </div>

          {/* 操作 */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleCopy}
              className={copied ? "btn-acid" : "btn-red"}
            >
              {copied ? (
                <Check size={16} strokeWidth={2.5} />
              ) : (
                <Copy size={16} strokeWidth={2.5} />
              )}
              {copied ? "已复制" : "一键复制"}
            </button>
            <a
              href={result.commlist}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost text-sm"
            >
              <ExternalLink size={14} strokeWidth={2.5} />
              在新标签打开
            </a>
          </div>

          <p className="text-[11px] leading-relaxed text-muted">
            复制后可在浏览器地址栏粘贴打开，会进入京东购物车结算页。
          </p>
        </div>
      )}
    </section>
  );
}

function StepRow({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-2 border-2 border-ink p-2 ${highlight ? "bg-acid" : "bg-paper"
        }`}
    >
      <div className="flex items-center gap-1 px-1 py-0.5 text-[10px] font-bold uppercase tracking-wider">
        {icon}
        <span>{label}</span>
      </div>
      <code className="flex-1 break-all font-mono text-xs">{value}</code>
    </div>
  );
}

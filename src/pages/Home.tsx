import { useEffect, useState } from "react";
import { Sparkles, Zap, ArrowDown, Server, ShieldCheck } from "lucide-react";
import Header from "@/components/Header";
import InputCard from "@/components/InputCard";
import ResultPanel from "@/components/ResultPanel";
import HistoryDrawer from "@/components/HistoryDrawer";
import { useResolveStore } from "@/store/useResolveStore";

const EXAMPLE_TEXT = `【京东】 \`https://u.jd.com/X659fJ0\`  CA1393 「instax mini双白相纸 」
点击链接直接打开 或者复制文案打开京东

————————
更多好物推荐： \`https://u.jd.com/XgeY8Qd\``;

export default function Home() {
  const loadHistory = useResolveStore((s) => s.loadHistory);
  const setInput = useResolveStore((s) => s.setInput);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  useEffect(() => {
    loadHistory();
    // 探测后端
    fetch("/api/health")
      .then((r) => r.json())
      .then(() => setBackendOnline(true))
      .catch(() => setBackendOnline(false));
  }, [loadHistory]);

  const applyExample = () => setInput(EXAMPLE_TEXT);

  const scrollToWorkspace = () => {
    document
      .getElementById("workspace")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-full">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden border-b-2 border-ink">
        <div className="absolute inset-0 -z-10 opacity-[0.04]">
          <div className="absolute -right-20 top-10 font-display text-[280px] leading-none text-jd-red">
            BP
          </div>
        </div>
        <div className="grain absolute inset-0 -z-10" />

        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-20">
          <div className="grid gap-10 md:grid-cols-12">
            <div className="md:col-span-7 animate-rise">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span className="stamp-tag bg-jd-red text-paper">
                  <Sparkles size={12} strokeWidth={3} />
                  <span>v 2.0 · 反向解析</span>
                </span>
                <span className="stamp-tag bg-acid">
                  <Server size={12} strokeWidth={3} />
                  全栈 · 后端代理解析
                </span>
                <span className="stamp-tag bg-ink text-paper">
                  by pb
                </span>
                {backendOnline !== null && (
                  <span
                    className={`stamp-tag ${backendOnline
                      ? "bg-paper text-ink"
                      : "bg-jd-red text-paper"
                      }`}
                  >
                    <ShieldCheck size={12} strokeWidth={3} />
                    {backendOnline ? "后端在线" : "后端离线"}
                  </span>
                )}
              </div>

              <h2 className="font-display text-4xl leading-[1.05] md:text-6xl">
                bp 文案
                <br />
                <span className="bg-ink px-3 text-paper">反解</span>
                成
                <span className="relative inline-block">
                  <span className="relative z-10 text-jd-red">结算链接</span>
                  <span className="absolute -bottom-1 left-0 z-0 h-3 w-full bg-acid" />
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-soft md:text-lg">
                粘贴京东 bp 文案，工具自动提取短链 →
                <b className="text-jd-red">后端 fetch 跟随 302 跳转</b> →
                从最终商品页 URL 提取 skuId →
                拼装成 <code className="bg-acid px-1 font-mono text-sm">trade.m.jd.com/pay?commlist=...</code>
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={scrollToWorkspace}
                  className="btn-red"
                >
                  <Zap size={16} strokeWidth={2.5} />
                  开始解析
                </button>
                <button
                  type="button"
                  onClick={applyExample}
                  className="btn-ghost text-sm"
                >
                  <Sparkles size={14} strokeWidth={2.5} />
                  填入示例
                </button>
              </div>

              <ul className="mt-8 grid grid-cols-1 gap-2 text-sm text-ink-soft sm:grid-cols-3">
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-jd-red" /> 自动跟随重定向
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-acid" /> 提取 SKU ID
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-2 w-2 bg-ink" /> 一键复制结果
                </li>
              </ul>
            </div>

            {/* 示例卡片 */}
            <div className="md:col-span-5">
              <div className="press-card grain p-5">
                <div className="mb-3 flex items-center justify-between">
                  <span className="stamp-tag bg-ink text-paper">
                    SAMPLE · 示例输入
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    bp · text
                  </span>
                </div>
                <pre className="whitespace-pre-wrap break-all border-2 border-ink bg-paper p-4 font-mono text-[11px] leading-relaxed">
                  {EXAMPLE_TEXT}
                </pre>
                <div className="my-3 flex items-center justify-center gap-2 text-muted">
                  <span className="text-[11px] uppercase tracking-widest">
                    resolve
                  </span>
                  <ArrowDown size={12} />
                </div>
                <div className="bg-acid border-2 border-ink p-3 font-mono text-[11px] leading-relaxed break-all">
                  https://trade.m.jd.com/pay?commlist=
                  <span className="bg-ink px-1 text-paper">100154886849</span>
                  ,,1,
                  <span className="bg-ink px-1 text-paper">100154886849</span>
                  ,1,0,0
                </div>
                <p className="mt-3 text-[11px] text-muted">
                  点击「填入示例」可直接体验
                </p>
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={scrollToWorkspace}
          className="mx-auto mb-4 flex flex-col items-center gap-1 text-[11px] uppercase tracking-widest text-muted hover:text-ink"
        >
          <span>scroll</span>
          <ArrowDown size={14} className="animate-bounce" />
        </button>
      </section>

      {/* 工作区 */}
      <main
        id="workspace"
        className="mx-auto max-w-6xl px-4 py-12 md:px-8 md:py-16"
      >
        <div className="mb-8 flex items-end justify-between border-b-2 border-ink pb-3">
          <h3 className="font-display text-2xl md:text-3xl">工作台</h3>
          <span className="font-mono text-[11px] text-muted">
            STEP 01 → RESOLVE → OUTPUT
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <InputCard />
          </div>
          <div className="lg:col-span-5">
            <ResultPanel />
          </div>
        </div>
      </main>

      {/* 使用说明 */}
      <section className="border-t-2 border-ink bg-ink text-paper">
        <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
          <h3 className="font-display text-2xl md:text-3xl">如何使用 / 原理</h3>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <div className="mb-3 font-mono text-jd-red text-5xl font-bold">
                01
              </div>
              <h4 className="mb-2 font-display text-lg">粘贴 bp 文案</h4>
              <p className="text-sm leading-relaxed text-paper/70">
                把京东分享的 bp
                文案整段粘贴到左侧输入框，工具会自动识别其中的京东链接（短链或长链均可）。
              </p>
            </div>
            <div>
              <div className="mb-3 font-mono text-acid text-5xl font-bold">
                02
              </div>
              <h4 className="mb-2 font-display text-lg">后端解析</h4>
              <p className="text-sm leading-relaxed text-paper/70">
                Express 后端收到链接后，用 Node fetch
                模拟移动端浏览器访问短链，跟随 302
                跳转，直到拿到最终商品页 URL。
              </p>
            </div>
            <div>
              <div className="mb-3 font-mono text-paper text-5xl font-bold">
                03
              </div>
              <h4 className="mb-2 font-display text-lg">生成 commlist</h4>
              <p className="text-sm leading-relaxed text-paper/70">
                从最终 URL 提取 skuId（如 100154886849），按规则拼装为
                <code className="mx-1 bg-paper/10 px-1">
                  commlist=SKU,,1,SKU,1,0,0
                </code>
                即可一键复制。
              </p>
            </div>
          </div>

          <div className="mt-10 dashed-rule border-paper/30" />
          <p className="mt-4 text-[11px] text-paper/50">
            后端仅为代理解析服务，不存储任何数据。所有历史记录保存在你本机浏览器。
          </p>
        </div>
      </section>

      <footer className="border-t-2 border-ink bg-paper">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-4 py-6 text-xs text-muted md:flex-row md:items-center md:px-8">
          <div className="flex items-center gap-2">
            <span className="font-display text-base text-ink">pb · BP 反解工坊</span>
            <span>·</span>
            <span>京东 bp 文案 → commlist 结算链接</span>
          </div>
          <div className="font-mono">
            © {new Date().getFullYear()} · by pb
          </div>
        </div>
      </footer>

      <HistoryDrawer />
    </div>
  );
}

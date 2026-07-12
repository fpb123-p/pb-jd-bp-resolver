import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ---------- 工具函数 ---------- */

const JD_HOSTS = [
  "3.cn",
  "u.jd.com",
  "item.jd.com",
  "item.m.jd.com",
  "m.jd.com",
  "jd.com",
];

function isJdHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return JD_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** 从 bp 文案中提取第一个京东链接 */
function extractJdLink(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();

  // 1. 反引号包裹的链接（bp 文案常见格式）
  const backtickMatch = trimmed.match(/`?(https?:\/\/[^\s`"'，。、）)】]+)/);
  if (backtickMatch && isJdHost(backtickMatch[1])) {
    return backtickMatch[1];
  }

  // 2. 任意 https 链接（是京东域名）
  const urlMatch = trimmed.match(/https?:\/\/[^\s`"'，。、）)】]+/i);
  if (urlMatch && isJdHost(urlMatch[0])) {
    return urlMatch[0];
  }

  // 3. 兼容无协议的 3.cn/xxxx 或 u.jd.com/xxxx
  const shortMatch = trimmed.match(/(?:3\.cn|u\.jd\.com)\/[^\s`"'，。、）)】]+/i);
  if (shortMatch) return `https://${shortMatch[0]}`;

  return "";
}

/** 从 URL 中提取 skuId */
function extractSkuId(url: string): string | null {
  if (!url) return null;
  // item.jd.com/{skuId}.html
  const longMatch = url.match(/item\.jd\.com\/(\d+)/i);
  if (longMatch) return longMatch[1];
  // item.m.jd.com/product/{skuId}.html
  const mobileMatch = url.match(/item\.m\.jd\.com\/product\/(\d+)/i);
  if (mobileMatch) return mobileMatch[1];
  // mall.jd.com/index-{skuId}.html
  const mallMatch = url.match(/mall\.jd\.com\/index-(\d+)\.html/i);
  if (mallMatch) return mallMatch[1];
  // URL 参数中的 skuId / sku
  const paramMatch = url.match(/[?&](?:skuId|sku)=(\d+)/i);
  if (paramMatch) return paramMatch[1];
  // 通用：URL 中任意连续 6 位以上数字
  const numMatch = url.match(/\/(\d{6,})(?:\.html|\?|&|$|\/)/);
  if (numMatch) return numMatch[1];
  return null;
}

/** 拼装 commlist 结算链接 */
function buildCommlist(skuId: string): string {
  return `https://trade.m.jd.com/pay?commlist=${skuId},,1,${skuId},1,0,0`;
}

/** 判断是否为京东短链 */
function isShortLink(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "3.cn" || host === "u.jd.com";
  } catch {
    return false;
  }
}

/** fetch 短链跟随 302 跳转，返回最终 URL
 *  u.jd.com 短链返回 200 + HTML（含 `var hrl='https://u.jd.com/jda?...'`），
 *  需要 fetch 那个 jda URL 才能拿到 302 跳转到商品页 */
async function resolveShortLink(
  shortUrl: string
): Promise<{ finalUrl: string; status: number; hops: string[] }> {
  let currentUrl = shortUrl;
  const maxRedirects = 8;
  let lastStatus = 200;
  const hops: string[] = [shortUrl];

  for (let i = 0; i < maxRedirects; i++) {
    const res = await fetch(currentUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "zh-CN,zh;q=0.9",
        Referer: shortUrl,
      },
    });

    lastStatus = res.status;

    // 3xx 重定向：跟随 Location
    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location");
      if (!location) break;
      let nextUrl: string;
      if (location.startsWith("http")) {
        nextUrl = location;
      } else {
        const base = new URL(currentUrl);
        nextUrl = new URL(location, base).toString();
      }
      hops.push(nextUrl);
      currentUrl = nextUrl;
      continue;
    }

    // 200 + HTML：从 HTML 中提取 var hrl='...'，再 fetch（u.jd.com 短链常见模式）
    if (res.status === 200) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("text/html")) {
        const html = await res.text();
        const hrlMatch = html.match(/var\s+hrl\s*=\s*['"]([^'"]+)['"]/);
        if (hrlMatch && hrlMatch[1]) {
          const nextUrl = hrlMatch[1];
          hops.push(`[html-jump] ${nextUrl}`);
          currentUrl = nextUrl;
          continue;
        }
      }
    }

    break;
  }

  return { finalUrl: currentUrl, status: lastStatus, hops };
}

/* ---------- 路由 ---------- */

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "jd-bp-resolver", time: Date.now() });
});

interface ResolveRequest {
  text?: string;
  link?: string;
}

app.post("/api/resolve", async (req, res) => {
  try {
    const body = (req.body || {}) as ResolveRequest;
    const input = (body.text || body.link || "").trim();

    if (!input) {
      return res.status(400).json({
        ok: false,
        error: "请输入 bp 文案或链接",
      });
    }

    // 1. 提取链接
    const sourceLink = extractJdLink(input);
    if (!sourceLink) {
      return res.status(400).json({
        ok: false,
        error: "未识别到京东链接",
      });
    }

    let finalUrl = sourceLink;

    // 2. 短链需要跟随重定向
    if (isShortLink(sourceLink)) {
      try {
        const result = await resolveShortLink(sourceLink);
        finalUrl = result.finalUrl;
        console.log(`  → 短链跳转：${sourceLink} → ${finalUrl}`);
        console.log(`    hops: ${result.hops.length}, status: ${result.status}`);
      } catch (err) {
        return res.status(502).json({
          ok: false,
          sourceLink,
          finalUrl: sourceLink,
          error: `短链解析失败：${(err as Error).message}`,
        });
      }
    }

    // 3. 提取 skuId
    const skuId = extractSkuId(finalUrl);
    if (!skuId) {
      return res.status(200).json({
        ok: false,
        sourceLink,
        finalUrl,
        skuId: null,
        commlist: null,
        error: "已解析链接，但未能在最终 URL 中识别出 skuId",
      });
    }

    // 4. 拼装 commlist
    const commlist = buildCommlist(skuId);
    console.log(`  → skuId: ${skuId}`);
    console.log(`  → commlist: ${commlist}`);

    return res.json({
      ok: true,
      sourceLink,
      finalUrl,
      skuId,
      commlist,
    });
  } catch (err) {
    console.error("[/api/resolve] error:", err);
    return res.status(500).json({
      ok: false,
      error: (err as Error).message || "服务器内部错误",
    });
  }
});

app.listen(PORT, () => {
  console.log(`\n  ✦ pb · JD BP Resolver API`);
  console.log(`  ➜  Local:  http://localhost:${PORT}`);
  console.log(`  ➜  Health: http://localhost:${PORT}/api/health\n`);
});

/* ---------- 生产环境：托管前端静态资源 ---------- */
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));

// SPA fallback：所有未匹配的 GET 请求返回 index.html
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

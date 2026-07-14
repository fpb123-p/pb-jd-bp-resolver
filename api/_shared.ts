// Vercel Serverless Function 共享工具函数
// 不含 Express / 文件系统依赖

const JD_HOSTS = [
  "3.cn",
  "u.jd.com",
  "item.jd.com",
  "item.m.jd.com",
  "m.jd.com",
  "jd.com",
];

export function isJdHost(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return JD_HOSTS.some((h) => host === h || host.endsWith(`.${h}`));
  } catch {
    return false;
  }
}

/** 从 bp 文案中提取第一个京东链接 */
export function extractJdLink(text: string): string {
  if (!text) return "";
  const trimmed = text.trim();

  const backtickMatch = trimmed.match(/`?(https?:\/\/[^\s`"'，。、）)】]+)/);
  if (backtickMatch && isJdHost(backtickMatch[1])) {
    return backtickMatch[1];
  }

  const urlMatch = trimmed.match(/https?:\/\/[^\s`"'，。、）)】]+/i);
  if (urlMatch && isJdHost(urlMatch[0])) {
    return urlMatch[0];
  }

  const shortMatch = trimmed.match(/(?:3\.cn|u\.jd\.com)\/[^\s`"'，。、）)】]+/i);
  if (shortMatch) return `https://${shortMatch[0]}`;

  return "";
}

/** 从 URL 中提取 skuId */
export function extractSkuId(url: string): string | null {
  if (!url) return null;
  const longMatch = url.match(/item\.jd\.com\/(\d+)/i);
  if (longMatch) return longMatch[1];
  const mobileMatch = url.match(/item\.m\.jd\.com\/product\/(\d+)/i);
  if (mobileMatch) return mobileMatch[1];
  const mallMatch = url.match(/mall\.jd\.com\/index-(\d+)\.html/i);
  if (mallMatch) return mallMatch[1];
  const paramMatch = url.match(/[?&](?:skuId|sku)=(\d+)/i);
  if (paramMatch) return paramMatch[1];
  const numMatch = url.match(/\/(\d{6,})(?:\.html|\?|&|$|\/)/);
  if (numMatch) return numMatch[1];
  return null;
}

/** 拼装 commlist 结算链接 */
export function buildCommlist(skuId: string): string {
  return `https://trade.m.jd.com/pay?commlist=${skuId},,1,${skuId},1,0,0`;
}

/** 判断是否为京东短链 */
export function isShortLink(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return host === "3.cn" || host === "u.jd.com";
  } catch {
    return false;
  }
}

/**
 * fetch 短链跟随跳转，返回最终 URL
 * u.jd.com 短链返回 200 + HTML（含 var hrl='...'），
 * 需要 fetch 那个 jda URL 才能拿到 302 跳转
 */
export async function resolveShortLink(
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

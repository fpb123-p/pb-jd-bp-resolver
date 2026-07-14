// Vercel Serverless: POST /api/resolve
import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  extractJdLink,
  extractSkuId,
  buildCommlist,
  isShortLink,
  resolveShortLink,
} from "./_shared";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 只允许 POST
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "仅支持 POST 请求" });
  }

  try {
    const input = ((req.body?.text || req.body?.link || "") as string).trim();

    if (!input) {
      return res.status(400).json({ ok: false, error: "请输入 bp 文案或链接" });
    }

    const sourceLink = extractJdLink(input);
    if (!sourceLink) {
      return res.status(400).json({ ok: false, error: "未识别到京东链接" });
    }

    let finalUrl = sourceLink;

    if (isShortLink(sourceLink)) {
      try {
        const result = await resolveShortLink(sourceLink);
        finalUrl = result.finalUrl;
        console.log(`  → 短链跳转：${sourceLink} → ${finalUrl}`);
      } catch (err) {
        return res.status(502).json({
          ok: false,
          sourceLink,
          finalUrl: sourceLink,
          error: `短链解析失败：${(err as Error).message}`,
        });
      }
    }

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

    const commlist = buildCommlist(skuId);
    console.log(`  → skuId: ${skuId}, commlist: ${commlist}`);

    return res.json({ ok: true, sourceLink, finalUrl, skuId, commlist });
  } catch (err) {
    console.error("[/api/resolve] error:", err);
    return res.status(500).json({
      ok: false,
      error: (err as Error).message || "服务器内部错误",
    });
  }
}

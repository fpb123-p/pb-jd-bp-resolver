// 本地开发 Express 服务器（Vercel 部署不用这个文件）
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  extractJdLink,
  extractSkuId,
  buildCommlist,
  isShortLink,
  resolveShortLink,
} from "../api/_shared";

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

/* ---------- API ---------- */

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "pb-jd-bp-resolver", time: Date.now() });
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
});

/* ---------- 生产模式：托管前端静态资源 ---------- */
const distPath = path.resolve(__dirname, "../dist");
app.use(express.static(distPath));
app.get("*", (_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`\n  ✦ pb · JD BP Resolver API`);
  console.log(`  ➜  Local:  http://localhost:${PORT}`);
  console.log(`  ➜  Health: http://localhost:${PORT}/api/health\n`);
});

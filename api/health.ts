// Vercel Serverless: GET /api/health
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.json({ ok: true, service: "pb-jd-bp-resolver", time: Date.now() });
}

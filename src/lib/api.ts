/**
 * 后端 API 客户端
 */

export interface ResolveResponse {
  ok: boolean;
  sourceLink?: string;
  finalUrl?: string;
  skuId?: string | null;
  commlist?: string | null;
  error?: string;
}

export async function resolveBpText(text: string): Promise<ResolveResponse> {
  const res = await fetch("/api/resolve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  let data: ResolveResponse;
  try {
    data = (await res.json()) as ResolveResponse;
  } catch {
    data = { ok: false, error: `服务器返回异常（${res.status}）` };
  }

  if (!res.ok && !data.error) {
    data.error = `请求失败（${res.status}）`;
  }

  return data;
}

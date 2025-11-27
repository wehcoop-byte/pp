// src/services/api.ts
export const API_BASE = (import.meta.env.VITE_API_BASE as string) || "/api";

async function j<T>(resp: Response): Promise<T> {
  if (!resp.ok) {
    let msg = `${resp.status} ${resp.statusText}`;
    try { const body = await resp.json(); if (body?.error) msg = body.error; } catch {}
    throw new Error(msg);
  }
  return resp.json() as Promise<T>;
}

export type GenerateReq = { photoBase64: string; petName: string; styleId: string; email?: string; };
export type GenerateResp = { jobId: string; previewUrl: string; likenessScore: number; attempts: number; final: boolean; };

export async function apiGenerate(body: GenerateReq): Promise<GenerateResp> {
  const r = await fetch(`${API_BASE}/generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), credentials: "include" });
  return j<GenerateResp>(r);
}

export async function apiRegenerate(jobId: string): Promise<GenerateResp> {
  const r = await fetch(`${API_BASE}/regenerate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }), credentials: "include" });
  return j<GenerateResp>(r);
}

export async function apiLock(jobId: string, tweaks?: unknown) {
  const r = await fetch(`${API_BASE}/lock`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId, tweaks }), credentials: "include" });
  return j<{ jobId: string; status: string }>(r);
}

export async function apiUpscale(jobId: string) {
  const r = await fetch(`${API_BASE}/upscale`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ jobId }), credentials: "include" });
  return j<{ jobId: string; printReadyUrl: string; alreadyUpscaled?: boolean }>(r);
}

export async function apiGetJob(jobId: string) {
  const r = await fetch(`${API_BASE}/job/${encodeURIComponent(jobId)}`, { method: "GET", credentials: "include" });
  return j(r);
}

export async function apiReportError(payload: any) {
  const r = await fetch(`${API_BASE}/report-error`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload), credentials: "include" });
  return j(r);
}

export type FulfillmentKind = "digital" | "physical";
export async function apiCheckout(args: {
  productId: string; productTitle?: string;
  shippingAddress: { email: string; fullName?: string; address1?: string; address2?: string; city?: string; state?: string; postcode?: string; country?: string; } | null;
  fulfillmentKind: FulfillmentKind;
  customImageUrl?: string | null; // post-purchase upscaled URL
}) {
  const r = await fetch(`${API_BASE}/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(args), credentials: "include" });
  return j<{ ok: true; orderId: number }>(r);
}

// Dev helpers
export async function apiMockGenerate(prompt: string, image: string) {
  const r = await fetch(`${API_BASE}/mock-generate`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, image }), credentials: "include" });
  return j(r);
}
export async function apiWatermark(imageBase64: string) {
  const r = await fetch(`${API_BASE}/watermark`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64 }), credentials: "include" });
  return j<{ ok: boolean; imageBase64: string }>(r);
}

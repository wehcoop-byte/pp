// server/services/upscaler.ts
// Backend upscaler implementation (ESM).
// Fixes: ERR_MODULE_NOT_FOUND from importing ../../src/services/upscaler on the server.
// Usage: import { upscaleImage } from "./services/upscaler.js";

import { createRequire } from "module";
const require = createRequire(import.meta.url);

type FetchLike = typeof fetch;
const f: FetchLike = globalThis.fetch;

const UPSCALER_URL = process.env.UPSCALER_URL || "";   // e.g., https://upscaler.your-domain.run/app
const UPSCALER_KEY = process.env.UPSCALER_KEY || "";   // optional bearer

export async function upscaleImage(imageBase64: string): Promise<string> {
  // If no external upscaler configured, return the original for now.
  if (!UPSCALER_URL) {
    // TODO: plug in your local ESRGAN/ESRGAN-lite or Cloud Run upscaler service.
    return imageBase64;
  }
  const res = await f(`${UPSCALER_URL}/upscale`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(UPSCALER_KEY ? { Authorization: `Bearer ${UPSCALER_KEY}` } : {}),
    },
    body: JSON.stringify({ imageBase64 }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Upscaler HTTP ${res.status} ${text}`);
  }
  const data = await res.json();
  const out = data?.imageBase64;
  if (!out || typeof out !== "string") {
    throw new Error("Upscaler returned invalid payload");
  }
  return out;
}
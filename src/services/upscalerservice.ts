// src/services/upscalerService.ts
import fetch from "node-fetch";

const { UPSCALER_URL } = process.env;

if (!UPSCALER_URL) {
  console.warn("[upscalerService] UPSCALER_URL is not set. Upscaling will be skipped.");
}

export async function upscaleImageBase64(imageBase64: string, scale = 4): Promise<string> {
  if (!UPSCALER_URL) return imageBase64; // fail-soft

  const payload = {
    imageBase64,
    scale,
  };

  const res = await fetch(UPSCALER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[upscaleImageBase64] Upscaler error:", res.status, text);
    throw new Error(`Upscaler failed: ${res.status}`);
  }

  const json = (await res.json()) as { upscaledBase64: string };
  return json.upscaledBase64;
}

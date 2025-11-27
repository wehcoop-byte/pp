// server/services/upscale.ts
import fetch from "node-fetch";

export async function upscaleImage(buffer: Buffer, scale = 2): Promise<Buffer> {
  // Replace with your real upscaler-service URL/contract
  const res = await fetch("http://localhost:8788/upscale", {
    method: "POST",
    headers: { "content-type": "application/octet-stream", "x-scale": String(scale) },
    body: buffer,
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Upscaler error ${res.status}: ${t}`);
  }
  const arr = await res.arrayBuffer();
  return Buffer.from(arr);
}

// server/services/finalize.ts
import { storageGetBuffer, putPrintReady } from "./storage_ext";
import { upscaleImage } from "./upscale";

/**
 * Finalize a job for delivery:
 * - fetch original or best intermediate
 * - upscale
 * - store in print-ready bucket (private)
 * Returns stored key.
 */
export async function finalizeDigital(jobId: string, sourceKey: string, opts?: { scale?: number }) {
  const raw = await storageGetBuffer(sourceKey);
  const scaled = await upscaleImage(raw, opts?.scale ?? 2);
  const finalKey = `${jobId}/final.jpg`;
  await putPrintReady(finalKey, scaled, "image/jpeg");
  return finalKey;
}

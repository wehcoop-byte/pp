// server/routes/final_stream.ts
import { Router } from "express";
import type { Response, Request } from "express";
import { Storage } from "@google-cloud/storage";
import { env } from "../env.js";

const storage = new Storage();
const finalsBucket = storage.bucket(
  env.GCS_BUCKET_PRINTREADY || env.GCS_BUCKET_PREVIEWS
);

/**
 * Streams the final, print-ready image to an Express Response.
 * Keeps your signed URLs off the client.
 */
export async function streamFinalToResponse(res: Response, jobId: string) {
  const key = `${jobId}/final.jpg`; // keep in sync with your finalize writer
  const file = finalsBucket.file(key);

  const [exists] = await file.exists();
  if (!exists) {
    res.status(404).json({ ok: false, error: "Final image not found" });
    return;
  }

  const [meta] = await file.getMetadata();
  if (meta.size) res.setHeader("Content-Length", meta.size);
  res.setHeader("Content-Type", meta.contentType || "image/jpeg");
  res.setHeader("Cache-Control", "private, max-age=3600");

  file
    .createReadStream()
    .on("error", (e) => {
      console.error("Stream error:", e);
      if (!res.headersSent) res.status(500).json({ ok: false, error: "Stream failed" });
    })
    .pipe(res);
}

/** Optional REST endpoints */
export const finalStreamRouter = Router();

finalStreamRouter.head("/:jobId", async (req: Request, res: Response) => {
  try {
    const key = `${req.params.jobId}/final.jpg`;
    const [exists] = await finalsBucket.file(key).exists();
    return res.sendStatus(exists ? 200 : 404);
  } catch (err) {
    console.error("HEAD /final error:", err);
    return res.sendStatus(500);
  }
});

finalStreamRouter.get("/:jobId", async (req: Request, res: Response) => {
  try {
    await streamFinalToResponse(res, req.params.jobId);
  } catch (err: any) {
    console.error("GET /final error:", err);
    if (!res.headersSent) res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
});

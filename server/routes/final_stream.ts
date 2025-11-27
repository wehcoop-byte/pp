// server/routes/final_stream.ts
import { Router } from "express";
import type { Response, Request } from "express";
import { Storage } from "@google-cloud/storage";
import { env } from "../env";

const storage = new Storage();
const finalsBucket =
  storage.bucket(
    env.GCS_BUCKET_PRINTREADY || env.GCS_BUCKET_FINALS || env.GCS_BUCKET_PREVIEWS
  );

/**
 * Streams the final, print-ready image to an Express Response.
 * Keeps your signed URLs off the client.
 */
export async function streamFinalToResponse(res: Response, jobId: string) {
  const key = `${jobId}/final.jpg`; // keep in sync with your upscale/finalize writer

  const file = finalsBucket.file(key);
  const [exists] = await file.exists();
  if (!exists) {
    res.status(404).json({ ok: false, error: "Final image not found" });
    return;
  }

  const [meta] = await file.getMetadata();
  res.setHeader("Content-Type", meta.contentType || "image/jpeg");
  res.setHeader("Cache-Control", "private, max-age=3600");
  // If you want a forced download:
  // res.setHeader("Content-Disposition", `attachment; filename="${jobId}-final.jpg"`);

  // Pipe the GCS stream to the response
  file
    .createReadStream()
    .on("error", (e) => {
      console.error("Stream error:", e);
      if (!res.headersSent) res.status(500).json({ ok: false, error: "Stream failed" });
    })
    .pipe(res);
}

/**
 * Optional router if you want REST endpoints:
 *   HEAD /api/final/:jobId  -> existence check
 *   GET  /api/final/:jobId  -> streams image
 */
export const finalStreamRouter = Router();

finalStreamRouter.head("/:jobId", async (req: Request, res: Response) => {
  try {
    const key = `${req.params.jobId}/final.jpg`;
    const file = finalsBucket.file(key);
    const [exists] = await file.exists();
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

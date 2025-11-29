// server/routes/final.ts
import { Router } from "express";
import type { Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { env } from "../env.js";
import { streamFinalToResponse } from "./final_stream.js";
import { getJobById, updateJob } from "../services/jobs.js";
import { canUnlockFinal } from "../services/gates.js";

const router = Router();
const storage = new Storage();

const previewsBucket = storage.bucket(env.GCS_BUCKET_PREVIEWS);
const printreadyBucket = storage.bucket(
  env.GCS_BUCKET_PRINTREADY || env.GCS_BUCKET_PREVIEWS
);

/**
 * POST /api/final/:jobId/finalize
 * Copies {jobId}/preview.jpg -> {jobId}/final.jpg in the print-ready bucket.
 */
router.post("/:jobId/finalize", async (req: Request, res: Response) => {
  const { jobId } = req.params;

  try {
    const job = await getJobById(jobId);
    if (!job) return res.status(404).json({ ok: false, error: "Job not found" });

    const allowed = await canUnlockFinal({ job, isAdmin: false });
    if (!allowed) return res.status(403).json({ ok: false, error: "Final not allowed for this job" });

    const srcKey = `${jobId}/preview.jpg`;
    const dstKey = `${jobId}/final.jpg`;

    const src = previewsBucket.file(srcKey);
    const [exists] = await src.exists();
    if (!exists) return res.status(404).json({ ok: false, error: "Preview not found" });

    const dst = printreadyBucket.file(dstKey);
    await src.copy(dst);
    await dst.setMetadata({
      contentType: "image/jpeg",
      cacheControl: "public, max-age=31536000"
    });

    // Best-effort job update
    try {
      await updateJob(jobId, {
        // status: "finalized", // only if your JobStatus includes it
        printReadyUrl: `gs://${printreadyBucket.name}/${dstKey}`
      });
    } catch {
      /* optional repo: ignore if not available */
    }

    return res.status(201).json({ ok: true, key: dstKey });
  } catch (err: any) {
    console.error("Finalize error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Finalize failed" });
  }
});

/**
 * GET /api/final/:jobId — stream print-ready via backend
 */
router.get("/:jobId", async (req: Request, res: Response) => {
  try {
    await streamFinalToResponse(res, req.params.jobId);
  } catch (err: any) {
    console.error("Stream final error:", err);
    if (!res.headersSent) res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
});

/**
 * HEAD /api/final/:jobId — existence check
 */
router.head("/:jobId", async (req: Request, res: Response) => {
  try {
    const key = `${req.params.jobId}/final.jpg`;
    const [exists] = await printreadyBucket.file(key).exists();
    return res.sendStatus(exists ? 200 : 404);
  } catch (err) {
    console.error("HEAD final error:", err);
    return res.sendStatus(500);
  }
});

export const finalRouter = router;

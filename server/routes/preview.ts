// server/routes/preview.ts
import { Router } from "express";
import type { Request, Response } from "express";
import { addLogoTiledWatermark } from "../services/watermark.js";
import { Storage } from "@google-cloud/storage";
import { env } from "../env.js";

const router = Router();
const storage = new Storage();
const bucket = storage.bucket(env.GCS_BUCKET_PREVIEWS);

/**
 * POST /api/preview
 * Body: { jobId: string, buffer: base64, contentType?: string }
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { jobId, buffer, contentType } = req.body || {};
    if (!jobId || !buffer) {
      return res.status(400).json({ ok: false, error: "Missing jobId or buffer" });
    }

    // tolerate data URLs or naked base64
    const base64 = typeof buffer === "string" ? buffer.replace(/^data:\w+\/\w+;base64,/, "") : "";
    const raw = Buffer.from(base64, "base64");

    const watermarked = await addLogoTiledWatermark(raw); // should return Buffer
    const key = `${jobId}/preview.jpg`;

    const file = bucket.file(key);
    await file.save(watermarked, {
      resumable: false,
      metadata: {
        contentType: contentType || "image/jpeg",
        cacheControl: "private, max-age=3600"
      }
    });

    return res.status(201).json({ ok: true, key });
  } catch (err: any) {
    console.error("Preview generation failed:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

/**
 * GET /api/preview/:jobId
 * Streams the stored watermarked preview back to the client.
 */
router.get("/:jobId", async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const key = `${jobId}/preview.jpg`;
    const file = bucket.file(key);

    const [exists] = await file.exists();
    if (!exists) {
      return res.status(404).json({ ok: false, error: "Preview not found" });
    }

    const [meta] = await file.getMetadata();
    if (meta.size) res.setHeader("Content-Length", meta.size);
    res.setHeader("Content-Type", meta.contentType || "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");

    file.createReadStream()
      .on("error", (err) => {
        console.error("Preview stream error:", err);
        if (!res.headersSent) res.status(500).json({ ok: false, error: "Stream failed" });
      })
      .pipe(res);
  } catch (err: any) {
    console.error("Preview fetch failed:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

export const previewRouter = router;

// server/routes/uploads.ts
import { Router } from "express";
import type { Request, Response } from "express";
import { Storage } from "@google-cloud/storage";
import { env } from "../env";

const router = Router();
const storage = new Storage();
const bucket = storage.bucket(env.GCS_BUCKET_ORIGINALS);

// POST /api/upload
// Receives base64 or signed URL data and stores it in the originals bucket
router.post("/", async (req: Request, res: Response) => {
  try {
    const { jobId, imageBase64, contentType } = req.body || {};
    if (!jobId || !imageBase64)
      return res.status(400).json({ ok: false, error: "Missing jobId or imageBase64" });

    const buffer = Buffer.from(imageBase64, "base64");
    const key = `${jobId}/original.jpg`;

    await bucket.file(key).save(buffer, {
      resumable: false,
      metadata: { contentType: contentType || "image/jpeg" },
      cacheControl: "private, max-age=3600",
    });

    return res.status(201).json({ ok: true, key });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return res.status(500).json({ ok: false, error: err.message });
  }
});

// GET /api/upload/:jobId
// Streams back the uploaded original for debugging or testing
router.get("/:jobId", async (req: Request, res: Response) => {
  try {
    const jobId = req.params.jobId;
    const key = `${jobId}/original.jpg`;
    const file = bucket.file(key);
    const [exists] = await file.exists();
    if (!exists)
      return res.status(404).json({ ok: false, error: "Original not found" });

    const [meta] = await file.getMetadata();
    res.setHeader("Content-Type", meta.contentType || "image/jpeg");
    res.setHeader("Cache-Control", "private, max-age=3600");

    file.createReadStream().pipe(res);
  } catch (err: any) {
    console.error("Stream original failed:", err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

export const uploadRouter = router;

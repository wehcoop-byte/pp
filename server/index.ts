// server/index.ts
import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";

// Middleware (request id + access logs)
import { requestId, logger } from "./middleware/logging.js";

// Your existing helpers
import { ipLimitGenerateMemory } from "./rate-limit-memory.js";
import { addTiledWatermark } from "./watermark.js";

// Real backend routes (yours)
import checkoutRouter from "./api.js";                  // /api/checkout
import generationRouter from "./routes/generation.js";  // /api/generate, /regenerate, /lock, /upscale, /job/:id, /report-error

// New routes we’re wiring in
import { uploadsRouter } from "./routes/uploads.js";    // /api/uploads (resumable + post-policy)
import { previewRouter } from "./routes/preview.js";    // /api/preview  (watermark + proxy)
import { finalRouter } from "./routes/final.js";        // /api/final    (finalize + stream)
import { adminRouter } from "./routes/admin.js";        // /api/admin    (feature flags)
import { webhooksRouter } from "./routes/webhooks.js";  // /api/webhooks/shopify (paid)

// ----------------------------------------------------------------------------
// App bootstrap
// ----------------------------------------------------------------------------
const app = express();
app.set("trust proxy", true);

// Security & core middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "same-site" } }));
app.use(cors({ origin: true, credentials: true }));
app.use(cookieParser());

// Note: keep JSON payloads modest; large binaries should NOT be JSON/base64
app.use(express.json({ limit: "2mb" }));

// Request correlation & logging
app.use(requestId);
app.use(logger);

// ----------------------------------------------------------------------------
// 0) ENV flags (kept from your version)
// ----------------------------------------------------------------------------
const USE_MOCK_LIKENESS = process.env.USE_MOCK_LIKENESS === "1";

// ----------------------------------------------------------------------------
// 0.5) Health
// ----------------------------------------------------------------------------
app.get("/healthz", (_req, res) => res.status(200).json({ ok: true }));

// ----------------------------------------------------------------------------
// 1) REAL BACKEND ROUTES
// ----------------------------------------------------------------------------

// New: direct-to-GCS upload helpers (resumable + post policy)
app.use("/api/uploads", uploadsRouter);

// New: preview creation/stream via backend proxy (short-lived, watermarked)
app.use("/api/preview", previewRouter);

// New: finalize + stream print-ready (digital-only path supported by policy)
app.use("/api/final", finalRouter);

// New: admin feature flags (test mode / payment bypass for admin only)
app.use("/api/admin", adminRouter);

// Your existing routes
app.use("/api", generationRouter);  // generation + post-purchase upscale
app.use("/api", checkoutRouter);    // checkout + email

// Webhooks: mount RAW body only for this path so HMAC checks can work
app.use("/api/webhooks", express.raw({ type: "*/*", limit: "5mb" }));
app.use("/api/webhooks", webhooksRouter);

// ----------------------------------------------------------------------------
// 2) DEV/UTILITY ENDPOINTS YOU ALREADY HAD (kept)
// ----------------------------------------------------------------------------

// (A) Mock preview generator with watermarking (kept for dev)
app.post("/api/mock-generate", ipLimitGenerateMemory, async (req, res) => {
  // This expects JSON; ensure this endpoint stays AFTER express.json
  const { prompt, image } = (req as any).body || {};
  if (!prompt?.trim()) return res.status(400).json({ ok: false, error: "Prompt is required." });
  if (!image?.toString()) return res.status(400).json({ ok: false, error: "Image is required." });

  try {
    const preview = await addTiledWatermark(String(image), {
      opacity: 0.7,
      spacing: 180,
      fontSize: 56,
      angle: -28
    });
    return res.json({ ok: true, data: { imageBase64: preview } });
  } catch (e: any) {
    console.error("Watermarking failed:", e);
    return res.status(500).json({ ok: false, error: "Watermarking failed" });
  }
});

// (B) Mock likeness vs fallback
app.post("/api/rate", (_req, res) => {
  if (USE_MOCK_LIKENESS) {
    return res.json({
      ok: true,
      score: 0.91,
      parts: { clip_head: 0.93, clip_multi: 0.90, clip_full: 0.89 },
      meta: { source: "mock" }
    });
  }
  return res.json({
    ok: true,
    score: 0.84,
    parts: { clip_full: 0.84 },
    meta: { source: "temp-fallback" }
  });
});

// (C) Watermark endpoint
app.post("/api/watermark", async (req, res) => {
  const { imageBase64 } = (req as any).body || {};
  if (!imageBase64) return res.status(400).json({ ok: false, error: "imageBase64 required" });

  try {
    const out = await addTiledWatermark(imageBase64);
    return res.json({ ok: true, imageBase64: out });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "watermark failed" });
  }
});

// (D) Placeholder upscale (kept for dev; real one is /api/upscale on generationRouter)
app.post("/api/mock-upscale", async (req, res) => {
  const { imageBase64 } = (req as any).body || {};
  if (!imageBase64) return res.status(400).json({ ok: false, error: "imageBase64 required" });
  return res.json({ ok: true, imageBase64 });
});

// ----------------------------------------------------------------------------
// 3) ERROR HANDLER + START SERVER
// ----------------------------------------------------------------------------
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(err?.status || 500).json({ error: "internal", message: err?.message || "Unknown error" });
});

const PORT = Number(process.env.PORT || 8080);
app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}  (USE_MOCK_LIKENESS=${USE_MOCK_LIKENESS ? "1" : "0"})`);
});

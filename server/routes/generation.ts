// server/routes/generation.ts
import { Router } from "express";
import { createJob, getJobById, updateJob } from "../services/jobs";
import { uploadOriginal, uploadPreview, uploadPrintReady, downloadOriginal } from "../services/storage";
import { generateImageWithGemini } from "../services/gemini";
import { scoreLikeness } from "../services/likeness";
import { upscaleImage } from "../services/upscaler";
import { checkAndIncrementRateLimit } from "../services/rateLimit";
import { sendCustomerEmail, sendAdminErrorEmail } from "../services/email";

const router = Router();
const MAX_ATTEMPTS = Number(process.env.MAX_GENERATION_ATTEMPTS || 3);
const LIKENESS_THRESHOLD = Number(process.env.LIKENESS_THRESHOLD || 0.85);

// --- NEW ENDPOINT FOR FRONTEND ---
router.post("/likeness", async (req, res) => {
  try {
    const { sourceBase64, targetBase64 } = req.body;
    const score = await scoreLikeness(sourceBase64, targetBase64);
    res.json({ score });
  } catch (err) {
    console.error("Error in /likeness", err);
    res.status(500).json({ error: "Likeness scoring failed" });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const { photoBase64, petName, styleId, email, prompt } = req.body;
    const ip = (req.ip || req.headers["x-forwarded-for"] || "unknown") as string;

    const allowed = await checkAndIncrementRateLimit(String(ip));
    if (!allowed.ok) {
      return res.status(429).json({ error: "Free generation limit reached" });
    }

    const job = await createJob({ petName, styleId, email, ip: String(ip), prompt });

    const originalUrl = await uploadOriginal(job.id, photoBase64);
    await updateJob(job.id, { originalUrl, status: "generating" });

    const result = await runGenerationPipeline(job.id, {
      imageBase64: photoBase64,
      originalUrl,
      prompt,
      maxAttempts: MAX_ATTEMPTS,
      likenessThreshold: LIKENESS_THRESHOLD
    });

    if (email) {
      sendCustomerEmail(email, "artwork_ready", {
        jobId: job.id,
        previewUrl: result.previewUrl
      }).catch(console.error);
    }

    res.json({
      jobId: job.id,
      previewUrl: result.previewUrl,
      likenessScore: result.likenessScore,
      attempts: result.attempts,
      final: result.final
    });
  } catch (err: any) {
    console.error("Error in /generate", err);
    try { await sendAdminErrorEmail("Generate failed", { error: String(err) }); } catch {}
    res.status(500).json({ error: "Failed to generate image" });
  }
});

router.post("/regenerate", async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = await getJobById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    
    const imageBase64 = await downloadOriginal(job.id);
    const usedPrompt = (job as any).prompt || `A portrait of ${job.petName || "pet"}`;

    const result = await runGenerationPipeline(job.id, {
      imageBase64,
      originalUrl: job.originalUrl || "",
      prompt: usedPrompt,
      maxAttempts: MAX_ATTEMPTS,
      likenessThreshold: LIKENESS_THRESHOLD,
      isRegeneration: true
    });

    res.json({
      jobId: job.id,
      previewUrl: result.previewUrl,
      likenessScore: result.likenessScore,
      attempts: result.attempts,
      final: result.final
    });
  } catch (err) {
    console.error("Error in /regenerate", err);
    res.status(500).json({ error: "Failed to regenerate image" });
  }
});

// ... (Keep /lock, /upscale, /job, /report-error as is) ...
router.post("/lock", async (req, res) => {
  try {
    const { jobId, tweaks } = req.body;
    const job = await getJobById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (!job.generatedUrl) return res.status(400).json({ error: "No generated image to lock" });

    await updateJob(jobId, { status: "locked", lockTweaks: tweaks || null });
    res.json({ jobId, status: "locked" });
  } catch (err) {
    console.error("Error in /lock", err);
    res.status(500).json({ error: "Failed to lock artwork" });
  }
});

router.post("/upscale", async (req, res) => {
  try {
    const { jobId } = req.body;
    const job = await getJobById(jobId);
    if (!job) return res.status(404).json({ error: "Job not found" });
    if (!job.generatedUrl) return res.status(400).json({ error: "No generated image found to upscale" });

    if (job.printReadyUrl) {
      return res.json({ jobId, printReadyUrl: job.printReadyUrl, alreadyUpscaled: true });
    }

    const upscaledUrl = await upscaleImage(job.generatedUrl);
    const storedPrintUrl = await uploadPrintReady(jobId, upscaledUrl);

    await updateJob(jobId, { status: "upscaled", printReadyUrl: storedPrintUrl });
    res.json({ jobId, printReadyUrl: storedPrintUrl });
  } catch (err) {
    console.error("Error in /upscale", err);
    res.status(500).json({ error: "Failed to upscale image" });
  }
});

router.get("/job/:jobId", async (req, res) => {
  const job = await getJobById(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  res.json(job);
});

router.post("/report-error", async (req, res) => {
  try {
    await sendAdminErrorEmail("Frontend error report", req.body || {});
    res.json({ ok: true });
  } catch (err) {
    console.error("Error in /report-error", err);
    res.status(500).json({ error: "Failed to report error" });
  }
});

async function runGenerationPipeline(
  jobId: string,
  opts: { 
    imageBase64: string; 
    originalUrl: string; 
    prompt: string; 
    maxAttempts: number; 
    likenessThreshold: number; 
    isRegeneration?: boolean; 
  }
) {
  const attempts: Array<{ attempt: number; score: number; generatedImageUrl: string }> = [];
  let bestScore = 0;
  let bestImageBase64: string | null = null;

  for (let attempt = 1; attempt <= opts.maxAttempts; attempt++) {
    const generatedBase64 = await generateImageWithGemini({ 
      imageBase64: opts.imageBase64,
      prompt: opts.prompt 
    });
    
    // PASS BASE64 TO SCORER (Not URL)
    const score = await scoreLikeness(opts.imageBase64, generatedBase64);
    
    // Don't save huge base64 in attempts array either (Firestore limit)
    attempts.push({ attempt, score, generatedImageUrl: "view_in_storage" });

    if (score > bestScore) {
      bestScore = score;
      bestImageBase64 = generatedBase64;
    }
    if (score >= opts.likenessThreshold) break;
  }

  if (!bestImageBase64) {
    await updateJob(jobId, { status: "error", error: "No successful generations" });
    throw new Error("Generation pipeline produced no images");
  }

  // UPLOAD TO STORAGE FIRST (Fixes Firestore 1MB limit)
  const storageUrl = await uploadPreview(jobId, bestImageBase64);

  await updateJob(jobId, {
    status: "generated",
    previewUrl: storageUrl,
    printReadyUrl: null,
    generatedUrl: storageUrl, // Save the URL, NOT the Base64 data!
    likeness: { score: bestScore, threshold: opts.likenessThreshold, attempts }
  });

  return { 
    previewUrl: storageUrl, 
    likenessScore: bestScore, 
    attempts: attempts.length, 
    final: true // Always return true so UI shows result
  };
}

export default router;
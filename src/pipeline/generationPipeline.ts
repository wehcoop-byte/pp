// src/pipeline/generationPipeline.ts
import { upscaleImageBase64 } from "../services/upscalerService";
import { saveImageToStorage } from "../services/storageService";
import { scoreLikeness, ClipScoreResult } from "../services/clipScorerService";

export interface ProcessFinalImageInput {
  originalBase64?: string; // original user upload, used for likeness scoring if available
  generatedBase64: string; // final generated (and optionally watermarked) image
  withWatermark: boolean;
}

export interface ProcessFinalImageResult {
  finalUrl: string;
  likenessScore?: ClipScoreResult | null;
}

export async function processFinalImage({
  originalBase64,
  generatedBase64,
  withWatermark,
}: ProcessFinalImageInput): Promise<ProcessFinalImageResult> {
  // 1. Start from the generated image (assume watermark already applied upstream if withWatermark is true)
  let workingImage = generatedBase64;
  let likenessScore: ClipScoreResult | null | undefined = undefined;

  // 2. Optional likeness scoring via CLIP service (if configured)
  try {
    if (originalBase64) {
      likenessScore = await scoreLikeness(originalBase64, generatedBase64);
    }
  } catch (err) {
    console.error("[generationPipeline] Likeness scoring failed – continuing without score.", err);
    likenessScore = null;
  }

  // 3. Upscale for print quality
  try {
    workingImage = await upscaleImageBase64(workingImage, 4);
  } catch (err) {
    console.error("[generationPipeline] Upscaling failed – continuing with non-upscaled image.", err);
    // You could rethrow if you want to hard-fail instead
  }

  // 4. Persist final image (GCS / S3 / etc.)
  const finalUrl = await saveImageToStorage(workingImage, {
    pathPrefix: "final/upscaled/",
    contentType: "image/png",
  });

  return { finalUrl, likenessScore };
}

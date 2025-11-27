import type { Request, Response } from "express";
import { pipeline } from "@xenova/transformers";
import Jimp from "jimp";

/**
 * We use 'any' here because @xenova/transformers pipeline()
 * returns an object that does NOT match its own .d.ts definitions.
 * For runtime, this is perfectly fine.
 */
let extractor: any = null;

/** Lazy load CLIP extractor */
async function getExtractor() {
  if (!extractor) {
    extractor = (await pipeline(
      "feature-extraction",
      "Xenova/clip-vit-base-patch32"
    )) as any;
  }
  return extractor;
}

/** Convert a data URL or bare base64 into a Node Buffer */
function dataURLtoBuffer(s: string): Buffer {
  const i = s.indexOf("base64,");
  const base64 = i >= 0 ? s.slice(i + "base64,".length) : s;
  return Buffer.from(base64, "base64");
}

/** Convert base64/DataURL to CLIP embedding vector */
async function imageToEmbeddingFromBase64(
  base64OrDataURL: string
): Promise<number[]> {
  const buf = dataURLtoBuffer(base64OrDataURL);

  const img = await Jimp.read(buf);
  img.contain(224, 224); // CLIP expected size

  const resizedBuffer = await img.getBufferAsync(Jimp.MIME_PNG);

  const clip = await getExtractor();
  const output = await clip(resizedBuffer);

  // transformers.js output could be nested; normalise it
  const main =
    Array.isArray(output) ? output : output?.data ?? output?.[0] ?? null;

  const embedding =
    Array.isArray(main?.[0]) ? main[0] : Array.isArray(main) ? main : null;

  if (!embedding) {
    throw new Error("Failed to compute CLIP embedding");
  }

  return embedding.map((v: any) => Number(v) || 0);
}

/** Compute cosine similarity of two numeric vectors */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;

  let dot = 0;
  let na = 0;
  let nb = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }

  const denom = Math.sqrt(na) * Math.sqrt(nb) || 1e-9;
  return dot / denom;
}

/**
 * Express handler:
 * POST /api/likeness
 * Body:
 * {
 *   original:  base64 data URL
 *   generated: base64 data URL
 * }
 */
export async function handleLikeness(req: Request, res: Response) {
  try {
    const { original, generated } = req.body || {};

    if (!original || !generated) {
      return res.status(400).json({
        ok: false,
        error: "Both 'original' and 'generated' images are required.",
      });
    }

    const [origVec, genVec] = await Promise.all([
      imageToEmbeddingFromBase64(String(original)),
      imageToEmbeddingFromBase64(String(generated)),
    ]);

    const score = cosineSimilarity(origVec, genVec);

    return res.json({
      ok: true,
      score,
      parts: {
        clip_full: score,
      },
      meta: {
        model: "Xenova/clip-vit-base-patch32",
        backend: "transformers.js",
      },
    });
  } catch (err: any) {
    console.error("CLIP likeness error:", err);
    return res.status(500).json({
      ok: false,
      error: err?.message || "Failed to compute likeness score",
    });
  }
}

export default handleLikeness;

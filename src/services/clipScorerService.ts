// src/services/clipScorerService.ts
import fetch from "node-fetch";

const { CLIP_SCORER_URL } = process.env;

if (!CLIP_SCORER_URL) {
  console.warn("[clipScorer] CLIP_SCORER_URL is not set. Likeness scoring disabled.");
}

export interface ClipScoreResult {
  similarity_raw: number;
  similarity_01: number;
  message: string;
}

export async function scoreLikeness(
  originalBase64: string,
  generatedBase64: string
): Promise<ClipScoreResult | null> {
  if (!CLIP_SCORER_URL) return null;

  const payload = {
    imageABase64: originalBase64,
    imageBBase64: generatedBase64,
  };

  const res = await fetch(CLIP_SCORER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error("[clipScorer] scorer error:", res.status, text);
    return null;
  }

  const json = (await res.json()) as ClipScoreResult;
  return json;
}

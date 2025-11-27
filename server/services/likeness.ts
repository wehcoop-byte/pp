// server/services/likeness.ts
import fetch from "node-fetch";

const CLIP_URL = process.env.CLIP_SCORER_URL || "http://127.0.0.1:8001/score";
const USE_MOCK = process.env.USE_MOCK_LIKENESS === "1";

export async function scoreLikeness(sourceImage: string, generatedImage: string): Promise<number> {
  if (USE_MOCK) {
    console.log("[Likeness] Mocking score (0.92)");
    return 0.92;
  }

  console.log("[Likeness] Scoring via CLIP service...");

  try {
    const payload: any = {};
    
    // Smart detection of URL vs Base64
    if (sourceImage.startsWith("http")) payload.imageAUrl = sourceImage;
    else payload.imageABase64 = sourceImage;

    if (generatedImage.startsWith("http")) payload.imageBUrl = generatedImage;
    else payload.imageBBase64 = generatedImage;

    const res = await fetch(CLIP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error(`[Likeness] Service error (${res.status}):`, txt);
      return 0; 
    }

    const data: any = await res.json();
    const score = data.similarity_01 ?? 0;
    console.log(`[Likeness] Score: ${score.toFixed(3)}`);
    return score;

  } catch (err) {
    console.error("[Likeness] Network error:", err);
    return 0;
  }
}
// src/services/geminiService.ts
export type GenResponse =
  | { ok: true; data: { imageBase64: string; likenessScore?: number } }
  | { ok: false; error: string }
  & { headers?: Map<string, string> | { get: (k: string) => string | null } };

const MODEL = "gemini-3-pro-image-preview"; 

export async function generatePetPortrait(opts: {
  prompt: string;
  imageBase64: string;
  styleId: string;
  petName: string;
  email?: string;
}): Promise<GenResponse> {
  try {
    const res = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: MODEL,
        prompt: opts.prompt,
        photoBase64: opts.imageBase64,
        styleId: opts.styleId,
        petName: opts.petName,
        email: opts.email
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      let errMsg = `HTTP ${res.status}`;
      try {
        const json = JSON.parse(errText);
        if (json.error) errMsg = json.error;
      } catch {}
      return { ok: false, error: errMsg };
    }

    const data = await res.json();
    const finalImage = data?.previewUrl || data?.imageBase64;
    const likenessScore = data?.likenessScore; // <--- Capture the score from backend
    
    return { 
      ok: true, 
      data: { 
        imageBase64: finalImage, 
        likenessScore 
      }, 
      headers: res.headers as any 
    };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error" };
  }
}

// ... (rest of file remains the same)
export async function rateImageLikeness(opts: {
  sourceBase64: string;
  targetBase64: string;
}): Promise<{ ok: true; score: number } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/likeness", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(opts),
    });
    if (!res.ok) return { ok: false, error: `HTTP ${res.status}` };
    const data = await res.json();
    return { ok: true, score: data?.score ?? 0 };
  } catch (e: any) {
    return { ok: false, error: e?.message || "Network error" };
  }
}

export async function addWatermark(imageBase64: string): Promise<string> {
  const res = await fetch("/api/watermark", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64 }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data?.imageBase64 as string;
}

export async function upscaleImage(imageBase64: string): Promise<string> {
  const res = await fetch("/api/upscale", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageBase64, mode: "print_ready_4k" }),
  });
  if (!res.ok) throw new Error(`Upscale failed: HTTP ${res.status}`);
  const data = await res.json();
  return data?.imageBase64 as string;
}
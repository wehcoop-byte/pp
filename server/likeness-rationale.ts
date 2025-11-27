import type { Request, Response } from "express";

function base64(dataUrl: string): string {
  const i = dataUrl.indexOf("base64,");
  return i >= 0 ? dataUrl.slice(i + 7) : dataUrl.replace(/\r?\n|\r/g, "");
}
function mime(dataUrl: string): string {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,/);
  return m ? m[1] : "image/png";
}

export async function rationaleRoute(req: Request, res: Response) {
  try {
    const { imageA, imageB } = req.body || {};
    if (!imageA || !imageB) return res.status(400).json({ ok: false, error: "imageA and imageB required" });

    const rubric = [
      "You are a strict likeness evaluator for pet portraits.",
      "Compare Image A (original pet) and Image B (generated portrait).",
      "Return ONLY compact JSON: {\"rationale\":\"<one short sentence>\"}"
    ].join("\n");

    const payload = {
      contents: [
        {
          parts: [
            { text: rubric },
            { inline_data: { mime_type: mime(imageA), data: base64(imageA) } },
            { inline_data: { mime_type: mime(imageB), data: base64(imageB) } }
          ]
        }
      ],
      generationConfig: { responseMimeType: "application/json" }
    };

    const key = process.env.GEMINI_API_KEY;
    if (!key) return res.status(500).json({ ok: false, error: "GEMINI_API_KEY not set on server" });

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`;
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const t = await resp.text().catch(() => "");
      return res.status(resp.status).json({ ok: false, error: t || resp.statusText });
    }

    const json: any = await resp.json();
    let rationale = "Similar distinctive features are present.";
    try {
      const text = json?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        const obj = JSON.parse(text);
        if (typeof obj?.rationale === "string") rationale = obj.rationale;
      } else {
        console.error("Gemini response did not contain valid text part.");
      }
    } catch (e) {
      console.error("Failed to parse Gemini JSON response:", e);
    }

    return res.json({ ok: true, rationale });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || "rationale failed" });
  }
}

// server/services/gemini.ts
import fetch from "node-fetch";

type GenerateOpts = {
  imageBase64: string; // Can be raw base64 OR a URL
  prompt: string;
};

const MODEL = "gemini-3-pro-image-preview";
const API_KEY = process.env.GOOGLE_API_KEY;

// Helper to ensure we have just the base64 data
// Now smart enough to fetch from URL if needed
async function normalizeImageInput(input: string): Promise<string> {
  // Case A: It's a URL (from refinement)
  if (input.startsWith("http")) {
    console.log("[Gemini] Input is a URL, downloading...");
    const res = await fetch(input);
    if (!res.ok) throw new Error(`Failed to fetch refinement image: ${res.statusText}`);
    const buffer = await res.buffer();
    return buffer.toString("base64");
  }

  // Case B: It's already Base64 (initial upload)
  return input.replace(/^data:image\/\w+;base64,/, "");
}

export async function generateImageWithGemini(opts: GenerateOpts): Promise<string> {
  if (!API_KEY) throw new Error("GOOGLE_API_KEY not set");

  console.log(`[Gemini] Generating with model: ${MODEL}`);
  
  // 1. Normalize the image input (handle URL vs Base64)
  const cleanImage = await normalizeImageInput(opts.imageBase64);
  
  console.log(`[Gemini] Prompt: ${opts.prompt.substring(0, 50)}...`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: opts.prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: cleanImage // Use the normalized data
              }
            }
          ]
        }],
        generationConfig: {
          responseModalities: ["IMAGE"],
          imageConfig: {
            imageSize: "2K",
            aspectRatio: "1:1" 
          }
        }
      })
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errorText}`);
  }

  const data: any = await response.json();
  const candidate = data?.candidates?.[0];

  if (candidate?.finishReason && candidate.finishReason !== "STOP") {
    console.error("Gemini Finish Reason:", candidate.finishReason);
    throw new Error(`Gemini refused to generate. Reason: ${candidate.finishReason}`);
  }

  // Handle snake_case and camelCase
  const imagePart = candidate?.content?.parts?.find(
    (p: any) => p.inline_data || p.inlineData
  );
  
  if (!imagePart) {
    console.error("Gemini Response (No Image):", JSON.stringify(data, null, 2));
    throw new Error("Gemini finished but returned no image data.");
  }

  const base64Data = imagePart.inlineData?.data || imagePart.inline_data?.data;

  console.log("[Gemini] Success! Image data received.");
  return `data:image/png;base64,${base64Data}`;
}
// src/services/upscaler.ts
export async function upscaleImage(imageUrl: string): Promise<string> {
  const upscalerUrl = process.env.UPSCALER_URL;
  if (!upscalerUrl) {
    // if no upscaler configured, just pass-through
    return imageUrl;
  }

  // Call your upscaler service here with imageUrl, return URL of upscaled version.
  throw new Error("upscaleImage not implemented");
}

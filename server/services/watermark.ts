// server/services/watermark.ts
import { createCanvas, loadImage } from "@napi-rs/canvas";
import fs from "fs";
import path from "path";

/**
 * Adds your tiled watermark logo over an image.
 * Accepts base64 data URL or Buffer. Returns base64 JPEG.
 */
export async function addLogoTiledWatermark(input: Buffer | string): Promise<string> {
  // Normalize input to Buffer
  const buffer =
    typeof input === "string"
      ? (input.startsWith("data:") ? Buffer.from(input.split(",")[1], "base64") : Buffer.from(input, "base64"))
      : input;

  const img = await loadImage(buffer);
  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext("2d");

  // Draw original
  ctx.drawImage(img, 0, 0, img.width, img.height);

  // Find watermark asset
  const watermarkPath = path.resolve("server/assets/watermark.png");
  if (!fs.existsSync(watermarkPath)) {
    console.warn("⚠️  server/assets/watermark.png not found — returning unwatermarked image.");
    return canvas.toDataURL("image/jpeg", 0.9);
  }

  const watermark = await loadImage(watermarkPath);

  // Tiling parameters
  const tile = 300;   // spacing in px
  const scale = 1;    // 1 = original watermark size
  const opacity = 0.15;

  ctx.globalAlpha = opacity;

  const w = watermark.width * scale;
  const h = watermark.height * scale;

  // Diagonal tiled pattern
  for (let y = -h; y < img.height + h; y += tile) {
    for (let x = -w; x < img.width + w; x += tile) {
      ctx.drawImage(watermark, x, y, w, h);
    }
  }

  ctx.globalAlpha = 1;

  // Encode as JPEG base64 (data URL)
  return canvas.toDataURL("image/jpeg", 0.9);
}

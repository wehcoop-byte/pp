// server/watermark.ts
import sharp from "sharp";

export async function addTiledWatermark(base64Image: string, options?: {
  text?: string; opacity?: number; fontSize?: number; spacing?: number; angle?: number; blend?: sharp.Blend;
}) {
  const { text = "petpawtrait.net", opacity = 0.68, fontSize = 52, spacing = 200, angle = -30, blend = "overlay" } = options || {};
  const m = base64Image.match(/^data:(image\/\w+);base64,(.*)$/);
  if (!m) return base64Image;
  const imgBuf = Buffer.from(m[2], "base64");
  const meta = await sharp(imgBuf).metadata();
  const w = meta.width || 1200;
  const h = meta.height || 1200;

  const svg = `
  <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="p" width="${spacing}" height="${spacing}" patternUnits="userSpaceOnUse">
        <g transform="translate(${spacing/2}, ${spacing/2}) rotate(${angle})">
          <text x="0" y="0" font-size="${fontSize}" font-family="Arial, Helvetica, sans-serif"
                fill="rgba(255,255,255,${opacity})" dominant-baseline="middle" text-anchor="middle">
            ${text}
          </text>
        </g>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#p)"/>
  </svg>`;

  const composed = await sharp(imgBuf)
    .composite([{ input: Buffer.from(svg), blend }])
    .png()
    .toBuffer();

  return `data:image/png;base64,${composed.toString("base64")}`;
}

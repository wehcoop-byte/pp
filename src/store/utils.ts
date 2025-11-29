import type { Style } from "../data/styles";

const BASE_PROMPT = "It is essential to preserve the pet's exact likeness, unique features, markings, and fur color.";
const NEGATIVE_PROMPT = "Avoid: poorly drawn, deformed, extra limbs, blurry, pixelated, cartoon, 3d render, anime, watermark.";

export function buildPrompt(style: Style, petName: string, background: string, extra?: string) {
  const core = style.prompt
    .replace("{{Pet Name}}", petName || "My Pet")
    .replace("{{background}}", background || "a complementary background");
  const refine = extra?.trim() ? ` Refinement request: ${extra.trim()}.` : "";
  return `${core}. ${BASE_PROMPT} ${NEGATIVE_PROMPT}.${refine}`.trim();
}
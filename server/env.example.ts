/**
 * Fill these in LOCALLY ONLY.
 * Do NOT commit real keys.
 * Commit THIS FILE as the template.
 *
 * Cloud Run will override all these via environment variables.
 */

export const Env = {
  // Google / Gemini
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || "YOUR_GEMINI_API_KEY_HERE",

  // Shopify
  SHOPIFY_STORE: process.env.SHOPIFY_STORE || "yourshop.myshopify.com",
  SHOPIFY_TOKEN: process.env.SHOPIFY_TOKEN || "YOUR_SHOPIFY_ADMIN_API_TOKEN",

  // Printify
  PRINTIFY_TOKEN: process.env.PRINTIFY_TOKEN || "YOUR_PRINTIFY_API_TOKEN",

  // Optional internal service URLs
  CLIP_SCORER_URL: process.env.CLIP_SCORER_URL || "http://clip-scorer.internal",
  UPSCALER_URL: process.env.UPSCALER_URL || "http://upscaler.internal",

  // Feature switches
  USE_MOCK_LIKENESS: process.env.USE_MOCK_LIKENESS || "0"
};

// server/env.ts
import { cleanEnv, str, num, bool, port } from "envalid";

export const env = cleanEnv(process.env, {
  NODE_ENV:  str({ choices: ["development", "test", "production"], default: "development" }),
  PORT:      port({ default: 8080 }),

  // Google Cloud
  GOOGLE_CLOUD_PROJECT:           str({ default: "pet-pawtrait" }),
  GOOGLE_APPLICATION_CREDENTIALS: str({ default: "" }), // optional for local dev

  // Buckets (match your actual prod buckets exactly)
  GCS_BUCKET_ORIGINALS:  str({ default: "petpawtrait-originals-prod" }),
  GCS_BUCKET_PREVIEWS:   str({ default: "petpawtrait-previews-prod" }),
  GCS_BUCKET_PRINTREADY: str({ default: "petpawtrait-print-ready-prod" }),

  // App limits
  RATE_LIMIT_MAX_GENERATIONS: num({ default: 3 }),
  RATE_LIMIT_WINDOW_SECONDS:  num({ default: 3600 }),

  // Security
  ENABLE_HCAPTCHA: bool({ default: false }),
  HCAPTCHA_SECRET: str({ default: "" }),

  // Watermark
  WATERMARK_LOGO_PATH: str({ default: "server/assets/watermark.png" }),
  WATERMARK_OPACITY:   num({ default: 0.18 }),
  WATERMARK_SCALE:     num({ default: 1.0 }),

  // Observability
  SENTRY_DSN: str({ default: "" }),

  // Admin controls
  ADMIN_API_TOKEN: str({ default: "" }), // Bearer token for /api/admin toggles

  // Feature flags
  FEATURE_TEST_MODE:              bool({ default: false }), // bypass limits/payments for admin/test
  FEATURE_ALLOW_DIGITAL_ONLY:     bool({ default: true }),
  FEATURE_BYPASS_PAYMENT_FOR_TEST: bool({ default: false }),
});

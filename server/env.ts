import { cleanEnv, str, num, bool } from "envalid";

export const env = cleanEnv(process.env, {
  NODE_ENV:          str({ choices: ["development", "test", "production"], default: "development" }),
  PORT:              num({ default: 8080 }),

  GOOGLE_CLOUD_PROJECT:           str({ default: "" }),
  GOOGLE_APPLICATION_CREDENTIALS: str({ default: "" }),

  GCS_BUCKET_ORIGINALS:  str(),
  GCS_BUCKET_PREVIEWS:   str(),
  GCS_BUCKET_PRINTREADY: str({ default: "" }),

  GEMINI_API_KEY:  str({ default: "" }),
  SHOPIFY_TOKEN:   str({ default: "" }),
  PRINTIFY_TOKEN:  str({ default: "" }),

  // NEW: admin + ratelimit + feature flags
  ADMIN_API_TOKEN:             str({ default: "" }),
  RATE_LIMIT_WINDOW_SECONDS:   num({ default: 3600 }),
  RATE_LIMIT_MAX_GENERATIONS:  num({ default: 3 }),
  FEATURE_TEST_MODE:           bool({ default: false }),
  FEATURE_ALLOW_DIGITAL_ONLY:  bool({ default: true }),
  FEATURE_BYPASS_PAYMENT_FOR_TEST: bool({ default: false })
});

// server/services/featureFlags.ts
import { env } from "../env";

type Flags = {
  testMode: boolean;
  allowDigitalOnly: boolean;
  bypassPaymentForTest: boolean;
};

const flags: Flags = {
  testMode: env.FEATURE_TEST_MODE,
  allowDigitalOnly: env.FEATURE_ALLOW_DIGITAL_ONLY,
  bypassPaymentForTest: env.FEATURE_BYPASS_PAYMENT_FOR_TEST,
};

export function getFlags(): Flags {
  return { ...flags };
}

export function setFlags(patch: Partial<Flags>) {
  if (typeof patch.testMode === "boolean") flags.testMode = patch.testMode;
  if (typeof patch.allowDigitalOnly === "boolean") flags.allowDigitalOnly = patch.allowDigitalOnly;
  if (typeof patch.bypassPaymentForTest === "boolean") flags.bypassPaymentForTest = patch.bypassPaymentForTest;
  return getFlags();
}

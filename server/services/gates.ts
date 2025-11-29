// server/services/gates.ts
import { getFlags } from "./featureFlags.js";
import type { Job } from "../types/Job.js";
import { env } from "../env.js";

/**
 * You have one Job type. Use it everywhere.
 * This file no longer defines its own "Job".
 */

export function canGenerate(_user: unknown, _ctx?: unknown) {
  // Placeholder for future ACL
  return true;
}

type GateFlags = {
  testMode: boolean;
  bypassPaymentForTest: boolean;
  allowDigitalOnly: boolean;
};

// Detailed checker that returns reason codes (handy for logs/UX)
export function canUnlockFinalDetailed(params: {
  job: Job;
  isAdmin: boolean;
}): { ok: boolean; reason?: string } {
  const { job, isAdmin } = params;
  const flags = getFlags() as GateFlags;

  // Admin bypass in test mode, if enabled
  if (isAdmin && (flags.testMode || env.FEATURE_BYPASS_PAYMENT_FOR_TEST)) {
    return { ok: true };
  }

  // If likeness gating exists, enforce threshold (when present)
  const likenessOk = job.likeness
    ? job.likeness.score >= (job.likeness.threshold ?? 0.8)
    : true;

  // Acceptable statuses to consider “final-eligible”
  // Your canonical JobStatus includes: "generated", "locked", "upscaled" (you added),
  // "awaiting_payment", "paid", "sent_to_printify", "fulfilled", "error", etc.
  const eligibleStatus =
    job.status === "generated" ||
    job.status === "upscaled" ||
    job.status === "paid" ||
    job.status === "fulfilled" ||
    // if your pipeline marks the artifact done under a custom flag:
    (job as any).status === "print_ready";

  // Payment rule: require paid unless bypass flag is active
  const paymentOk =
    job.status === "paid" ||
    job.status === "fulfilled" ||
    env.FEATURE_BYPASS_PAYMENT_FOR_TEST === true;

  const ok = eligibleStatus && likenessOk && paymentOk;
  return ok ? { ok: true } : { ok: false, reason: "payment_required" };
}

// Boolean shim used by routes (what final.ts calls)
export async function canUnlockFinal(params: {
  job: Job;
  isAdmin: boolean;
}): Promise<boolean> {
  return canUnlockFinalDetailed(params).ok;
}

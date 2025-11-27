// server/services/gates.ts
import { getFlags } from "./featureFlags";

export type Job = {
  id: string;
  userId?: string | null;
  styleId: string;
  originalKey?: string;
  previewKey?: string;
  status: "queued" | "generating" | "likeness_check" | "preview_ready" | "awaiting_payment" | "paid" | "print_ready";
  productType?: "digital_only" | "print_bundle";
  // ... other metadata
};

export function canGenerate(_user: any, _ctx?: any) {
  // Room for ACLs later
  return true;
}

export function canUnlockFinal(params: {
  job: Job;
  isAdmin: boolean;
}): { ok: boolean; reason?: string } {
  const { job, isAdmin } = params;
  const flags = getFlags();

  if (isAdmin && flags.testMode && flags.bypassPaymentForTest) {
    return { ok: true };
  }

  if (job.productType === "digital_only" && flags.allowDigitalOnly) {
    // For digital-only, require either paid or explicit admin bypass in test mode
    if (job.status === "paid") return { ok: true };
    return { ok: false, reason: "payment_required" };
  }

  // For print bundles, only unlock after paid (Printify will be triggered elsewhere)
  if (job.status === "paid") return { ok: true };
  return { ok: false, reason: "payment_required" };
}

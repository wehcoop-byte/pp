// server/routes/final.ts
import { Router } from "express";
import type { Request, Response } from "express";
import { canUnlockFinal } from "../services/gates";
import { finalizeDigital } from "../services/finalize";
import { streamFinalToResponse } from "./final_stream";
import { getJobById } from "../services/jobRepo"; // you provide this (Firestore), stub below

export const finalRouter = Router();

/**
 * POST /api/final/:jobId
 * Body: { sourceKey?: string, scale?: number }
 * Effect: if policy allows, finalize and store print-ready file (no watermark).
 */
finalRouter.post("/:jobId", async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  const isAdmin = (req as any).admin === true;

  // TODO: real Firestore fetch
  const job = await getJobById(jobId);
  if (!job) return res.status(404).json({ error: "not_found" });

  const can = canUnlockFinal({ job, isAdmin });
  if (!can.ok) return res.status(402).json({ error: can.reason || "payment_required" });

  const sourceKey = req.body?.sourceKey || job.originalKey;
  if (!sourceKey) return res.status(400).json({ error: "missing_source" });

  const finalKey = await finalizeDigital(jobId, sourceKey, { scale: req.body?.scale ?? 2 });

  // TODO: persist job.status = 'print_ready' and finalKey to Firestore
  return res.status(201).json({ ok: true, finalKey });
});

/**
 * GET /api/final/:jobId
 * Streams the print-ready asset if the policy allowed finalize and the asset exists.
 */
finalRouter.get("/:jobId", async (req: Request, res: Response) => {
  const jobId = req.params.jobId;
  // You can add auth/session checks here if needed
  return streamFinalToResponse(jobId, res);
});

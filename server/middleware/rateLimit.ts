// server/middleware/rateLimit.ts
import type { Request, Response, NextFunction } from "express";
import { env } from "../env.js";
import { getFlags } from "../services/featureFlags.js";

type Key = string;
const counters = new Map<Key, { count: number; resetAt: number }>();

function keyFor(req: Request) {
  const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
  const sess = (req.cookies?.sid as string) || "nosid";
  const path = req.path.startsWith("/api/") ? req.path : "other";
  return `${ip}:${sess}:${path}`;
}

export function rateLimit(req: Request, res: Response, next: NextFunction) {
  const { testMode } = getFlags();
  const isAdminBypass = (req as any).admin === true;

  if (testMode && isAdminBypass) {
    // In test mode, admin traffic skips rate limiting entirely
    return next();
  }

  const now = Date.now();
  const windowMs = env.RATE_LIMIT_WINDOW_SECONDS * 1000;
  const max = env.RATE_LIMIT_MAX_GENERATIONS;

  const key = keyFor(req);
  const entry = counters.get(key);

  if (!entry || entry.resetAt <= now) {
    counters.set(key, { count: 1, resetAt: now + windowMs });
    return next();
  }

  if (entry.count >= max) {
    const retrySec = Math.ceil((entry.resetAt - now) / 1000);
    res.setHeader("Retry-After", String(retrySec));
    return res.status(429).json({ error: "rate_limited", retryAfterSeconds: retrySec });
  }

  entry.count += 1;
  next();
}

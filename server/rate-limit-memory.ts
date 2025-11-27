// server/rate-limit-memory.ts
import type { Request, Response, NextFunction } from "express";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_ATTEMPTS = 3;
const store = new Map<string, number[]>();

function getIp(req: Request) {
  const xf = (req.headers["x-forwarded-for"] as string) || "";
  const first = xf.split(",")[0]?.trim();
  return first || req.ip || req.socket.remoteAddress || "unknown";
}

export function ipLimitGenerateMemory(req: Request, res: Response, next: NextFunction) {
  const ip = getIp(req);
  const now = Date.now();
  const arr = store.get(ip) || [];
  const cutoff = now - WINDOW_MS;
  const pruned = arr.filter(t => t >= cutoff);
  const count = pruned.length;
  const remaining = Math.max(0, MAX_ATTEMPTS - count);

  res.setHeader("X-Gen-Attempts-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Limit", String(MAX_ATTEMPTS));
  res.setHeader("X-RateLimit-Remaining", String(remaining));

  if (count >= MAX_ATTEMPTS) {
    return res.status(429).json({ ok: false, error: "Rate limit exceeded", code: "GENERATION_LIMIT" });
  }

  const origJson = res.json.bind(res);
  res.json = (body: any) => {
    try {
      if (body?.ok !== false) {
        pruned.push(now);
        store.set(ip, pruned);
      }
    } catch {}
    return origJson(body);
  };

  next();
}

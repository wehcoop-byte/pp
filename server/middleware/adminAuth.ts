// server/middleware/adminAuth.ts
import type { Request, Response, NextFunction } from "express";
import { env } from "../env.js";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : "";
  if (!env.ADMIN_API_TOKEN || token !== env.ADMIN_API_TOKEN) {
    return res.status(401).json({ error: "unauthorized" });
  }
  (req as any).admin = true;
  next();
}

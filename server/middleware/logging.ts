import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";

export function requestId(req: Request, _res: Response, next: NextFunction) {
  (req as any).id = req.headers["x-request-id"] || randomUUID();
  next();
}

export function logger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  const id = (req as any).id;
  const { method, originalUrl } = req;

  res.on("finish", () => {
    const ms = Date.now() - start;
    const status = res.statusCode;
    const len = res.getHeader("content-length") || "-";
    console.log(`[${id}] ${method} ${originalUrl} ${status} ${len} - ${ms}ms`);
  });

  next();
}

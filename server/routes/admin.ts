// server/routes/admin.ts
import { Router } from "express";
import { adminAuth } from "../middleware/adminAuth.js";
import { getFlags, setFlags } from "../services/featureFlags.js";

export const adminRouter = Router();
adminRouter.use(adminAuth);

adminRouter.get("/flags", (_req, res) => {
  res.json(getFlags());
});

// PATCH /api/admin/flags { testMode?: boolean, allowDigitalOnly?: boolean, bypassPaymentForTest?: boolean }
adminRouter.patch("/flags", (req, res) => {
  const next = setFlags(req.body || {});
  res.json(next);
});

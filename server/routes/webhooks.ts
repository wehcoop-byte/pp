// server/routes/webhooks.ts
import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "node:crypto";
// import { updateJobPaid } from "../services/jobRepo"; // you implement this

export const webhooksRouter = Router();

// Minimal HMAC check (fill in your secret)
function verifyHmac(req: Request, secret: string) {
  const hmacHeader = req.get("X-Shopify-Hmac-Sha256") || "";
  const digest = crypto
    .createHmac("sha256", secret)
    .update(req.rawBody || "") // ensure raw body middleware for this route
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

// POST /api/webhooks/shopify
webhooksRouter.post("/shopify", async (req: Request, res: Response) => {
  // TODO: inject raw body and verify HMAC
  // if (!verifyHmac(req, process.env.SHOPIFY_WEBHOOK_SECRET!)) return res.status(401).end();

  const payload = req.body;
  try {
    // Extract jobId and productType from line items / note attributes
    // Convention: line_item.properties contains { key: "jobId", value: "<id>" }, { key: "productType", value: "digital_only"|"print_bundle" }
    const lines = payload?.line_items || [];
    for (const li of lines) {
      const props = li.properties || [];
      const jobProp = props.find((p: any) => p.name === "jobId" || p.key === "jobId");
      const typeProp = props.find((p: any) => p.name === "productType" || p.key === "productType");
      if (jobProp?.value) {
        const jobId = String(jobProp.value);
        const productType = typeProp?.value === "digital_only" ? "digital_only" : "print_bundle";
        // await updateJobPaid(jobId, productType);
      }
    }
    res.status(200).json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: "internal", message: e.message });
  }
});

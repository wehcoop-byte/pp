// server/routes/webhooks.ts
import { Router } from "express";
import type { Request, Response } from "express";
import crypto from "node:crypto";

export const webhooksRouter = Router();

// express.raw() must be mounted on /api/webhooks in index.ts before this router.
// Example (in server/index.ts):
//   app.use("/api/webhooks", express.raw({ type: "*/*", limit: "5mb" }));
//   app.use("/api/webhooks", webhooksRouter);

function getRawBody(req: Request): Buffer {
  const raw = (req as any).body;
  if (Buffer.isBuffer(raw)) return raw;
  if (typeof raw === "string") return Buffer.from(raw, "utf8");
  if (raw == null) return Buffer.alloc(0);
  return Buffer.from(JSON.stringify(raw), "utf8");
}

function verifyShopifyHmac(raw: Buffer, secret: string, hmacHeader: string): boolean {
  if (!secret || !hmacHeader) return false;
  const digest = crypto.createHmac("sha256", secret).update(raw).digest("base64");
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}

webhooksRouter.post("/shopify", async (req: Request, res: Response) => {
  try {
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET || "";
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256") || "";
    const topic = req.get("X-Shopify-Topic") || "";
    const shopDomain = req.get("X-Shopify-Shop-Domain") || "";

    const raw = getRawBody(req);
    if (!verifyShopifyHmac(raw, secret, hmacHeader)) {
      return res.status(401).json({ ok: false, error: "invalid webhook signature" });
    }

    let payload: any;
    try {
      payload = JSON.parse(raw.toString("utf8"));
    } catch {
      return res.status(400).json({ ok: false, error: "invalid JSON payload" });
    }

    // Example handling (no-ops by default)
    switch (topic) {
      case "orders/paid":
      case "orders/fulfilled":
      case "transactions/create": {
        // If you store jobId on line item properties, you can read it here
        const items: any[] = payload?.line_items || payload?.order?.line_items || [];
        for (const li of items) {
          const props: any[] = Array.isArray(li?.properties) ? li.properties : [];
          const jobProp = props.find(p => p?.name === "jobId" || p?.key === "jobId");
          if (jobProp?.value) {
            const jobId = String(jobProp.value);
            // TODO: update your job record here if needed
            // await updateJob(jobId, { status: "paid", shopifyOrderId: String(payload?.id || "") });
          }
        }
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ ok: true, shop: shopDomain, topic });
  } catch (err: any) {
    console.error("Webhook error:", err);
    return res.status(500).json({ ok: false, error: err?.message || "Unknown error" });
  }
});

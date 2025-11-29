// server/api.ts
import express from "express";
import type { Request, Response } from "express";
import { sendOrderEmails } from "./email.js";

const router = express.Router();

/**
 * Simple health probe for Cloud Run or your uptime checks.
 */
router.get("/healthz", (_req, res) => res.json({ ok: true }));

/**
 * POST /api/checkout
 *
 * Expects the FRONTEND to call this ONLY AFTER PAYMENT is confirmed
 * and ONLY AFTER you've upscaled the image client-side (per your rule).
 *
 * Body:
 * {
 *   productId: string,
 *   productTitle?: string,
 *   customImageUrl?: string,      // upscaled final (base64 data URL or https link)
 *   shippingAddress?: {
 *     fullName?: string;
 *     address1?: string;
 *     address2?: string;
 *     city?: string;
 *     state?: string;
 *     postcode?: string;
 *     country?: string;
 *     email?: string;             // REQUIRED for both digital + physical
 *   } | null,
 *   fulfillmentKind: "digital" | "physical"
 * }
 */
router.post("/checkout", async (req: Request, res: Response) => {
  try {
    const {
      productId,
      productTitle,
      customImageUrl,
      shippingAddress,
      fulfillmentKind,
    } = req.body ?? {};

    // basic validation
    if (!productId || !fulfillmentKind) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing productId or fulfillmentKind" });
    }

    const email: string | undefined = shippingAddress?.email;
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res
        .status(400)
        .json({ ok: false, error: "Missing or invalid purchaser email" });
    }

    // At this point you'd create a Shopify order/checkout session and attach
    // the upscaled image (customImageUrl) as a line-item property or metafield.
    // I'm not guessing your Shopify helper here; wire it where the comment is.

    // Fake order id for now; replace with real ID/number from Shopify if you wish.
    const orderId = Math.floor(100000 + Math.random() * 900000);

    // Send the right email: digital vs physical. Includes the bonus digital link when available.
    await sendOrderEmails({
      to: email,
      orderId,
      productTitle: productTitle || productId,
      downloadUrl: customImageUrl || null,
      fulfillmentKind,
    });

    // Respond to the client; if you add Shopify checkout URLs, include them here.
    return res.json({
      ok: true,
      orderId,
    });
  } catch (err: any) {
    console.error("[/api/checkout] error:", err);
    return res
      .status(500)
      .json({ ok: false, error: err?.message || "Checkout error" });
  }
});

export default router;

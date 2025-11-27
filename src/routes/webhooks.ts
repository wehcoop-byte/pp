// src/routes/webhooks.ts
import { Router } from "express";
import { verifyShopifyWebhook } from "../services/shopify";
import { getJobById, updateJob } from "../services/jobs";
import { createPrintifyOrder } from "../services/printify";
import { sendCustomerEmail } from "../services/email";

const router = Router();

// Shopify orders/paid webhook
router.post("/shopify", async (req, res) => {
  const rawBody = JSON.stringify(req.body);
  const hmac = req.headers["x-shopify-hmac-sha256"] as string;

  if (!verifyShopifyWebhook(hmac, rawBody)) {
    return res.status(401).send("Invalid HMAC");
  }

  const order = req.body;

  try {
    const lineItems = order.line_items || [];
    for (const item of lineItems) {
      const props = item.properties || [];
      const jobIdProp = props.find((p: any) => p.name === "jobId");
      if (!jobIdProp) continue;

      const jobId = jobIdProp.value;
      const job = await getJobById(jobId);
      if (!job) continue;

      await updateJob(jobId, {
        status: "paid",
        shopifyOrderId: String(order.id),
        shopifyOrderNumber: String(order.order_number)
      });

      const printifyOrderId = await createPrintifyOrder({
        jobId,
        printReadyUrl: job.printReadyUrl!,
        order
      });

      await updateJob(jobId, {
        status: "sent_to_printify",
        printifyOrderId
      });

      if (job.email) {
        sendCustomerEmail(job.email, "order_paid", {
          jobId,
          orderNumber: order.order_number
        }).catch(console.error);
      }
    }

    res.status(200).send("ok");
  } catch (err) {
    console.error("Error in Shopify webhook", err);
    res.status(500).send("error");
  }
});

// Optional: Printify webhook
router.post("/printify", async (req, res) => {
  // parse status, match to job via metadata/order id, update job.status
  res.sendStatus(200);
});

export default router;

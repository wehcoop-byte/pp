// src/services/printify.ts
import fetch from "node-fetch";

const PRINTIFY_TOKEN = process.env.PRINTIFY_TOKEN!;
const PRINTIFY_SHOP_ID = process.env.PRINTIFY_SHOP_ID!;

export async function createPrintifyOrder(opts: {
  jobId: string;
  printReadyUrl: string;
  order: any;
}): Promise<string> {
  const payload = {
    external_id: opts.jobId,
    label: `Pet PawtrAIt - ${opts.jobId}`,
    line_items: [
      {
        product_id: "YOUR_PRODUCT_ID",
        variant_id: "YOUR_VARIANT_ID",
        print_provider_id: 1,
        print_areas: [
          {
            variant_ids: ["YOUR_VARIANT_ID"],
            placeholders: [
              {
                position: "front",
                images: [{ url: opts.printReadyUrl }]
              }
            ]
          }
        ]
      }
    ],
    shipping_method: 1,
    send_shipping_notification: true,
    address_to: {
      first_name: opts.order.shipping_address.first_name,
      last_name: opts.order.shipping_address.last_name,
      email: opts.order.email,
      country: opts.order.shipping_address.country_code,
      address1: opts.order.shipping_address.address1,
      city: opts.order.shipping_address.city,
      zip: opts.order.shipping_address.zip
    }
  };

  const res = await fetch(
    `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PRINTIFY_TOKEN}`
      },
      body: JSON.stringify(payload)
    }
  );

  if (!res.ok) {
    const text = await res.text();
    console.error("Printify error", text);
    throw new Error("Failed to create Printify order");
  }

  const data = await res.json();
  return data.id;
}

// server/services/printify.ts
// Node 20+ has global fetch. No node-fetch import needed.

type MinimalShopifyOrder = {
  email?: string;
  shipping_address?: {
    first_name?: string;
    last_name?: string;
    country_code?: string;
    address1?: string;
    city?: string;
    zip?: string;
  };
};

type PrintifyCreateOrderResponse = { id: string };

function reqEnv(key: string): string {
  const v = process.env[key];
  if (!v) throw new Error(`Missing required env var: ${key}`);
  return v;
}

const PRINTIFY_TOKEN = reqEnv("PRINTIFY_TOKEN");
const PRINTIFY_SHOP_ID = reqEnv("PRINTIFY_SHOP_ID");

// TODO: replace these with your real catalog mapping
const DEFAULT_PRODUCT_ID = "YOUR_PRODUCT_ID";
const DEFAULT_VARIANT_ID = "YOUR_VARIANT_ID";
const DEFAULT_PRINT_PROVIDER_ID = 1;

export async function createPrintifyOrder(opts: {
  jobId: string;
  printReadyUrl: string;      // public or signed URL to your final image
  order: MinimalShopifyOrder; // pass in the bits we need
}): Promise<string> {
  const ship = opts.order.shipping_address ?? {};

  const payload = {
    external_id: opts.jobId,
    label: `Pet PawtrAIt - ${opts.jobId}`,
    line_items: [
      {
        product_id: DEFAULT_PRODUCT_ID,
        variant_id: DEFAULT_VARIANT_ID,
        print_provider_id: DEFAULT_PRINT_PROVIDER_ID,
        print_areas: [
          {
            variant_ids: [DEFAULT_VARIANT_ID],
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
      first_name: ship.first_name ?? "Customer",
      last_name: ship.last_name ?? "",
      email: opts.order.email ?? "",
      country: ship.country_code ?? "",
      address1: ship.address1 ?? "",
      city: ship.city ?? "",
      zip: ship.zip ?? ""
    }
  };

  const url = `https://api.printify.com/v1/shops/${PRINTIFY_SHOP_ID}/orders.json`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${PRINTIFY_TOKEN}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // Surface something useful for logs. Printify loves 400/422 when IDs are wrong.
    console.error("Printify create order failed:", res.status, text);
    throw new Error(`Printify order create failed (${res.status})`);
  }

  const data = (await res.json()) as unknown as PrintifyCreateOrderResponse;
  if (!data?.id) throw new Error("Printify response missing order id");
  return data.id;
}

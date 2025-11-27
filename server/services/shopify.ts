// src/services/shopifyService.ts
import { FulfillmentKind, Product } from "../data/products";

export async function fetchProducts(): Promise<Product[]> {
  // If you already hit Shopify, keep your logic and map to include `fulfillment`.
  // Example passthrough:
  const res = await fetch("/api/products");
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const items = await res.json();

  // Ensure each item has a mapped fulfillment kind.
  return items.map((p: any) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    image: p.image,
    fulfillment: p.fulfillment as FulfillmentKind // server should set this
  }));
}

export async function createShopifyCheckout(opts: {
  productId: string;
  customImageUrl: string;          // upscaled, post-purchase
  shippingAddress?: any | null;    // null for digital
  fulfillmentKind: FulfillmentKind; // "physical" | "digital"
}) {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(opts),
  });
  if (!res.ok) throw new Error(`Checkout failed: HTTP ${res.status}`);
  return await res.json();
}

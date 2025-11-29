// server/data/products.ts
export type FulfillmentKind = "digital" | "canvas" | "poster" | "framed";
export interface Product {
  id: string;
  kind: FulfillmentKind;
  title: string;
  variantId?: string;
}

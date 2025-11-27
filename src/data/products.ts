// src/data/products.ts
export type FulfillmentKind = "physical" | "digital";

export interface Product {
  id: string;
  title: string;
  price: number;
  image?: string;
  fulfillment: FulfillmentKind;
}

export const PRODUCTS: Product[] = [
  { id: "canvas-16x20", title: "Canvas 16×20", price: 129, fulfillment: "physical" },
  { id: "poster-12x18", title: "Poster 12×18", price: 59, fulfillment: "physical" },
  // PRICE SET TO 0 FOR TESTING
  { id: "digital-only", title: "Digital Portrait (4K)", price: 0, fulfillment: "digital" }
];
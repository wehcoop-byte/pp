import { PRODUCTS, Product } from '../data/products';

// Mock function to simulate fetching products from Shopify
export async function fetchProducts(): Promise<Product[]> {
  console.log('Fetching products from Shopify...');
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  console.log('Fetched products:', PRODUCTS);
  // In a real app, this would be an API call to Shopify's Storefront API
  return PRODUCTS;
}

interface ShopifyCheckoutPayload {
    productId: string;
    customImageUrl: string;
    shippingAddress: object;
}

// Mock function to simulate creating a checkout and processing the order
export async function createShopifyCheckout(payload: ShopifyCheckoutPayload): Promise<void> {
  console.log('Creating Shopify checkout and processing order with payload:', payload);
  // Simulate network delay for processing
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // In a real app, you would:
  // 1. Call Shopify's Storefront API to create a checkout.
  // 2. Add line items and custom properties.
  // 3. The API would return a `webUrl` for checkout.
  // Since this is a mock, we'll just log and complete successfully without returning a URL.
  console.log('Mock checkout and order processing successful.');
}

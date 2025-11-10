export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string; // URL to a mockup image of the product
}

export const PRODUCTS: Product[] = [
  {
    id: 'digital-pawtrait',
    name: 'Digital Pawtrait',
    description: 'High-resolution digital file',
    price: 19.99,
    imageUrl: 'https://storage.googleapis.com/aistudio-project-assets/app-assets/digital_mockup.png',
  },
  {
    id: 'canvas-12x12',
    name: 'Gallery Canvas',
    description: '12"x12" classic canvas',
    price: 49.99,
    imageUrl: 'https://storage.googleapis.com/aistudio-project-assets/app-assets/canvas_mockup.png',
  },
  {
    id: 'mug-11oz',
    name: 'Royal Mug',
    description: '11oz ceramic mug',
    price: 24.99,
    imageUrl: 'https://storage.googleapis.com/aistudio-project-assets/app-assets/mug_mockup.png',
  },
  {
    id: 'tshirt-unisex',
    name: 'Regal T-Shirt',
    description: 'Premium unisex cotton tee',
    price: 34.99,
    imageUrl: 'https://storage.googleapis.com/aistudio-project-assets/app-assets/tshirt_mockup.png',
  },
];
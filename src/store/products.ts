
import { create } from "zustand";
import * as shopifyService from "../services/shopifyService";
import type { Product } from "../data/products";

type ProductState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  load: () => Promise<void>;
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  load: async () => {
    if (get().loading || get().products.length) return;
    set({ loading: true, error: null });
    try {
      const list = await shopifyService.fetchProducts();
      set({ products: list, loading: false });
    } catch (e: any) {
      set({ error: e?.message || "Failed to load products", loading: false });
    }
  },
}));

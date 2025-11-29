import { create } from "zustand";
import type { Style } from "../data/styles";
import type { Product } from "../data/products";

type PawtraitState = {
  // Inputs
  originalImage: string | null;
  petName: string;
  background: string;
  selectedStyle: Style | null;

  // Outputs
  highResGeneratedImage: string | null;
  watermarkedImage: string | null;
  likenessScore: number | null;

  // Commerce
  selectedProduct: Product | null;

  // Actions
  setOriginalImage: (b64: string | null) => void;
  setPetName: (s: string) => void;
  setBackground: (s: string) => void;
  setSelectedStyle: (s: Style | null) => void;

  setGenerated: (img: string | null, wm: string | null, likeness?: number | null) => void;
  setSelectedProduct: (p: Product | null) => void;

  reset: () => void;
};

export const usePawtraitStore = create<PawtraitState>((set) => ({
  originalImage: null,
  petName: "",
  background: "",
  selectedStyle: null,

  highResGeneratedImage: null,
  watermarkedImage: null,
  likenessScore: null,

  selectedProduct: null,

  setOriginalImage: (b64) => set({ originalImage: b64 }),
  setPetName: (s) => set({ petName: s }),
  setBackground: (s) => set({ background: s }),
  setSelectedStyle: (s) => set({ selectedStyle: s }),

  setGenerated: (img, wm, likeness = null) => set({ highResGeneratedImage: img, watermarkedImage: wm, likenessScore: likeness }),
  setSelectedProduct: (p) => set({ selectedProduct: p }),

  reset: () =>
    set({
      originalImage: null,
      petName: "",
      background: "",
      selectedStyle: null,
      highResGeneratedImage: null,
      watermarkedImage: null,
      likenessScore: null,
      selectedProduct: null,
    }),
}));
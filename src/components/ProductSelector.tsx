// src/components/ProductSelector.tsx
import React from "react";
import { Product } from "../data/products";
import { Button } from "./Button";
import { PortraitDisplay } from "./components/PortraitDisplay"; // Re-using the display for context
import { Check, Truck, Download } from "lucide-react";

type Props = {
  generatedImage: string;
  products: Product[];
  isLoading: boolean;
  onSelectProduct: (p: Product) => void;
  onBack: () => void;
};

export const ProductSelector: React.FC<Props> = ({
  generatedImage,
  products,
  isLoading,
  onSelectProduct,
  onBack,
}) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 mt-8 pb-20">
      <div className="text-center mb-10">
        <h2 className="text-4xl font-heading text-[var(--brand-soft-white)] mb-3">
          Choose Your Format
        </h2>
        <p className="text-[var(--brand-muted-lavender)] text-lg">
          Select how you want to receive your masterpiece.
        </p>
      </div>

      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-12 items-start">
        
        {/* LEFT: Image Reference (Sticky) */}
        <div className="w-full lg:col-span-5 sticky top-24 hidden lg:block">
           <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              <img src={generatedImage} alt="Final Art" className="w-full h-auto" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-4 left-4 text-white font-heading text-sm opacity-80">
                 Ready for print
              </div>
           </div>
        </div>

        {/* RIGHT: Product List */}
        <div className="w-full lg:col-span-7 space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin w-10 h-10 border-4 border-[var(--brand-accent-orange)] border-t-transparent rounded-full"></div>
            </div>
          ) : (
            products.map((p) => (
              <div 
                key={p.id} 
                onClick={() => onSelectProduct(p)}
                className="interactive-card relative flex flex-col sm:flex-row items-center p-6 rounded-2xl bg-white/5 border border-white/10 cursor-pointer group"
              >
                {/* Icon/Image Placeholder */}
                <div className="w-full sm:w-32 aspect-square bg-black/30 rounded-xl flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 border border-white/5 group-hover:border-white/20 transition-colors">
                   {p.fulfillment === 'digital' ? (
                      <Download className="text-[var(--brand-accent-orange)] opacity-80" size={40} />
                   ) : (
                      <div className="text-4xl">🖼️</div>
                   )}
                </div>

                {/* Details */}
                <div className="flex-1 text-center sm:text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                        <h3 className="text-xl font-heading text-white group-hover:text-[var(--brand-accent-orange)] transition-colors">
                            {p.title}
                        </h3>
                        <span className="text-2xl font-bold text-white mt-2 sm:mt-0">
                            ${p.price}
                        </span>
                    </div>

                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 mb-4">
                        {p.fulfillment === 'digital' ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                <Check size={12} /> Instant Download
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                <Truck size={12} /> Free Shipping
                            </span>
                        )}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/5 text-white/60 border border-white/10">
                            High Res (4K)
                        </span>
                    </div>
                    
                    {/* Mobile-only button visual cue */}
                    <div className="sm:hidden w-full">
                        <Button text="Select" className="w-full py-2 text-sm" onClick={(e) => { e.stopPropagation(); onSelectProduct(p); }} />
                    </div>
                </div>

                {/* Desktop Arrow */}
                <div className="hidden sm:block ml-4 opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                    <div className="bg-[var(--brand-accent-orange)] rounded-full p-2 text-black">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
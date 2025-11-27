import React from "react";
import GlassCard from "./GlassCard";

export default function GalleryStrip({ items }:{ items:{ src:string; caption:string }[] }){
  return (
    <section className="relative max-w-7xl mx-auto px-6 pb-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Gallery</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((it,i)=>(
          <GlassCard key={i} className="overflow-hidden">
            <div className="h-48 rounded-xl2 overflow-hidden">
              <img src={it.src} alt={it.caption} className="w-full h-full object-cover"/>
            </div>
            <div className="mt-2 text-sm opacity-85">{it.caption}</div>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

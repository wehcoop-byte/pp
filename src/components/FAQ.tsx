import React, { useState } from "react";
import GlassCard from "./GlassCard";
import { faq } from "../content/copy";

export default function FAQ(){
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="relative max-w-7xl mx-auto px-6 pb-20">
      <h2 className="text-2xl md:text-3xl font-bold mb-6">Frequently asked</h2>
      <div className="grid md:grid-cols-2 gap-5">
        {faq.map((f,i)=>{
          const is = open===i;
          return (
            <GlassCard key={f.q}>
              <button onClick={()=>setOpen(is?null:i)} className="w-full text-left font-semibold flex items-center justify-between">
                {f.q}<span className="opacity-80">{is?"–":"+"}</span>
              </button>
              {is && <p className="mt-3 text-sm opacity-90">{f.a}</p>}
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

import React, { Suspense, useState } from "react";
import { motion } from "framer-motion";
import GlassCard from "./GlassCard";
import InfoTip from "./InfoTip";
import Modal from "./Modal";
import FAQ from "./FAQ";
import { brand, hero as heroCopy, valueProps, howItWorks, popovers } from "../content/copy";

const HeroScene = React.lazy(()=>import("./HeroScene"));

export default function LandingPage(){
  const [modalOpen, setModalOpen] = useState<null | "privacy" | "quality" | "styles">(null);

  return (
    <main className="relative min-h-[100svh] overflow-clip">
      <Suspense fallback={<div className="absolute inset-0 -z-10 opacity-40" />}>
        <HeroScene />
      </Suspense>

      <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl" style={{ background:"linear-gradient(135deg,#F4953E,#FFFAFF20)" }}/>
            <span className="font-semibold tracking-wide">{brand.name}</span>
          </div>
        </motion.div>
        <nav className="hidden md:flex gap-6 text-sm opacity-90">
          <a className="hover:opacity-100 opacity-80" href="#styles">Styles</a>
          <a className="hover:opacity-100 opacity-80" href="#how">How it works</a>
          <a className="hover:opacity-100 opacity-80" href="#faq">FAQ</a>
          <button className="hover:opacity-100 opacity-80" onClick={()=>setModalOpen("privacy")}>Privacy</button>
        </nav>
      </div>

      <section className="relative max-w-7xl mx-auto px-6 pt-8 md:pt-16 lg:pt-24 pb-12">
        <motion.h1 className="text-4xl md:text-6xl font-extrabold leading-[1.1]"
          initial={{ opacity:0, y:18 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.7 }}>
          {heroCopy.title}
        </motion.h1>
        <motion.p className="mt-4 md:mt-5 text-base md:text-lg max-w-2xl opacity-90"
          initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15, duration:0.6 }}>
          {heroCopy.subtitle}
        </motion.p>
        <motion.div className="mt-8 flex flex-col sm:flex-row gap-4"
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25, duration:0.5 }}>
          <a href="/app" className="rounded-xl px-5 py-3 font-semibold"
            style={{ background:"linear-gradient(135deg,#F4953E,#d57c2e)", color:"#1a0e24", boxShadow:"0 0 30px rgba(244,149,62,.35)" }}>
            Create your pawtrait
          </a>
          <button onClick={()=>setModalOpen("styles")} className="glass rounded-xl px-5 py-3 font-semibold border surface-line">
            Which style suits my pet?
          </button>
        </motion.div>

        <div className="mt-12 grid md:grid-cols-3 gap-5">
          {valueProps.map(v=>(
            <GlassCard key={v.label}>
              <div className="text-sm opacity-80 flex items-center">
                {v.label}<InfoTip>{v.help}</InfoTip>
              </div>
              <div className="text-2xl font-semibold mt-1">{v.value}</div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="styles" className="relative max-w-7xl mx-auto px-6 pb-16">
        <motion.h2 className="text-2xl md:text-3xl font-bold mb-2"
          initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          Pick your vibe
        </motion.h2>
        <p className="opacity-85 max-w-2xl mb-6">
          Each style preserves key features like eye color, muzzle shape, and coat pattern.{" "}
          <button onClick={()=>setModalOpen("styles")} className="underline decoration-[rgba(244,149,62,.6)] underline-offset-4">Style tips</button>
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {["Renaissance","Watercolor","Pop Art","Fantasy","Surreal","Pencil Sketch"].map(style=>(
            <GlassCard key={style} className="overflow-hidden group">
              <div className="h-40 w-full rounded-xl2 bg-[rgba(255,255,255,0.06)] animate-floaty" />
              <div className="mt-4 flex items-center justify-between">
                <div className="font-medium">{style}</div>
                <a href="/app" className="text-sm underline decoration-[rgba(244,149,62,.6)] underline-offset-4 opacity-90 group-hover:opacity-100">Try it</a>
              </div>
            </GlassCard>
          ))}
        </div>
      </section>

      <section id="how" className="relative max-w-7xl mx-auto px-6 pb-24">
        <motion.h2 className="text-2xl md:text-3xl font-bold mb-6"
          initial={{ opacity:0, y:12 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}>
          How it works
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-5">
          {howItWorks.map(item=>(
            <GlassCard key={item.step}>
              <div className="text-brand-soft/80 text-sm flex items-center">
                {item.step}<InfoTip>{item.pop}</InfoTip>
              </div>
              <div className="text-lg font-semibold mt-1">{item.title}</div>
              <p className="opacity-80 text-sm mt-2">{item.text}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-6 text-sm opacity-85">
          Curious about privacy or print quality?{" "}
          <button onClick={()=>setModalOpen("privacy")} className="underline decoration-[rgba(244,149,62,.6)] underline-offset-4">Privacy</button>{" "}•{" "}
          <button onClick={()=>setModalOpen("quality")} className="underline decoration-[rgba(244,149,62,.6)] underline-offset-4">Print quality</button>
        </div>
      </section>

      <FAQ />

      <footer className="relative border-t border-[rgba(255,255,255,.12)]/60">
        <div className="max-w-7xl mx-auto px-6 py-8 text-sm opacity-80">© {new Date().getFullYear()} {brand.name}. All rights reserved.</div>
      </footer>

      <Modal open={modalOpen==="styles"} onClose={()=>setModalOpen(null)} title="Choosing a style">
        <p className="mb-2">{popovers.styles}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Renaissance</b>: regal lighting, calm pose.</li>
          <li><b>Watercolor</b>: soft edges, great for fluffy coats.</li>
          <li><b>Pop Art</b>: bold color blocks, short coats shine.</li>
          <li><b>Fantasy</b>: dramatic ambience; keep subject sharp.</li>
          <li><b>Surreal</b>: dreamlike scene; subject centered.</li>
          <li><b>Pencil Sketch</b>: graphite shading on textured paper; timeless and understated.</li>
        </ul>
      </Modal>

      <Modal open={modalOpen==="privacy"} onClose={()=>setModalOpen(null)} title="Privacy & image handling">
        <p className="mb-2">{popovers.privacy}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Original uploads are private.</li>
          <li>Previews are watermarked and expire quickly.</li>
          <li>Finals are released only after payment or admin test bypass.</li>
        </ul>
      </Modal>

      <Modal open={modalOpen==="quality"} onClose={()=>setModalOpen(null)} title="Print quality">
        <p className="mb-2">{popovers.quality}</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Automatic upscaling and sharpening up to A2/16×20.</li>
          <li>Color-managed sRGB pipeline for consistent lab results.</li>
          <li>One round of likeness tweaks included if needed.</li>
        </ul>
      </Modal>
    </main>
  );
}

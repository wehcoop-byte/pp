import { FullPageSkeleton } from "../components/ui/FullPageSkeleton";

import React, { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePawtraitStore } from "../store/usePawtraitStore";
import { buildPrompt } from "../store/utils";
import { STYLES, Style } from "../data/styles";
import * as geminiService from "../services/geminiService";

import { ImageUploader } from "../components/ImageUploader";
import { StyleSelector } from "../components/StyleSelector";
import { GenerationProgress, StepKey } from "../components/GenerationProgress";
import { Button } from "../components/Button";
import Header from "../components/Header";
import { RefinementPanel } from "../components/refinement/RefinementPanel";

import { GeneratingSequence } from "../components/generation/GeneratingSequence";
export default function Create() {
  const navigate = useNavigate();
  const {
    originalImage,
    petName,
    background,
    selectedStyle,
    highResGeneratedImage,
    watermarkedImage,
    likenessScore,
    setOriginalImage,
    setPetName,
    setBackground,
    setSelectedStyle,
    setGenerated,
  } = usePawtraitStore();

  const [appStep, setAppStep] = useState<"idle" | "image" | "generating" | "result" | "error">("idle");
  const [genStep, setGenStep] = useState<StepKey>("PREPARING");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setOriginalImage(result);
      setAppStep("image");
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const runGeneration = useCallback(
    async (style: Style) => {
      if (!originalImage) throw new Error("Please upload a photo first.");
      setAppStep("generating");
      setGenStep("PREPARING");
      setStatus("Preparing your pawtrAIt…");
      setError("");

      const prompt = buildPrompt(style, petName, background);
      setGenStep("GENERATING");
      setStatus("Generating portrait…");

      const gen = await geminiService.generatePetPortrait({
        prompt,
        imageBase64: originalImage,
        styleId: style.id,
        petName,
        email: ""
      });
      if (!gen.ok) throw new Error(gen.error || "Generate failed");
      const generated = gen.data.imageBase64;
      if (!generated) throw new Error("No image returned");

      setGenStep("FINISHING");
      setStatus("Watermarking…");
      const wm = await geminiService.addWatermark(generated);
      setGenerated(generated, wm, gen.data.likenessScore ?? null);
      setAppStep("result");
    },
    [originalImage, petName, background, setGenerated]
  );

  const onGenerate = async () => {
    try {
      if (!selectedStyle) throw new Error("Please select a style.");
      await runGeneration(selectedStyle);
    } catch (e: any) {
      setError(e.message || "Something went wrong.");
      setAppStep("error");
    }
  };

  const canContinue = Boolean(watermarkedImage);

  return (
    <div className="min-h-screen flex flex-col w-full relative">
      <Header onOpenInfo={() => {}} />
      <main className="w-full flex-grow relative z-0">
        <div className="w-full max-w-6xl mx-auto px-4 py-10">
          {
  appStep === "generating" && (
    <div className="flex justify-center mt-20">
      <GeneratingSequence activeKey={genStep} sublabel={status} />
    </div>
  )
}

          {appStep !== "generating" && (
            <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
              {/* Left: image + inputs */}
              <div className="lg:col-span-5 space-y-6">
                <div className="relative">
                  {!originalImage ? (
                    <div className="bg-black/20 rounded-2xl p-6 border-2 border-white/10">
                      <ImageUploader onImageUpload={handleUpload} />
                    </div>
                  ) : (
                    <div className="relative group rounded-2xl overflow-hidden border-2 border-white/10 shadow-lg aspect-[4/5] bg-black/30">
                      <img src={originalImage} alt="Pet Upload" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[var(--brand-muted-lavender)] text-sm font-heading mb-2 ml-2 uppercase tracking-wider">
                      Pet's Name
                    </label>
                    <input
                      type="text"
                      value={petName}
                      onChange={(e) => usePawtraitStore.getState().setPetName(e.target.value)}
                      placeholder="e.g. Luna"
                      className="w-full p-4 bg-black/20 border-2 border-white/10 rounded-xl font-body text-white placeholder-white/30 focus:border-[var(--brand-accent-orange)] focus:bg-black/40 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--brand-muted-lavender)] text-sm font-heading mb-2 ml-2 uppercase tracking-wider">
                      Custom Background <span className="text-white/40 normal-case">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      value={background}
                      onChange={(e) => usePawtraitStore.getState().setBackground(e.target.value)}
                      placeholder="e.g. In a royal garden"
                      className="w-full p-4 bg-black/20 border-2 border-white/10 rounded-xl font-body text-white placeholder-white/30 focus:border-[var(--brand-accent-orange)] focus:bg-black/40 focus:outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Right: styles & action */}
              <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
                <div>
                  <h3 className="text-2xl font-heading text-white mb-6 text-center lg:text-left">Select an Artistic Style</h3>
                  <StyleSelector styles={STYLES} selectedStyle={selectedStyle} onSelectStyle={setSelectedStyle} />
                </div>

                <div className="pt-6 border-t border-white/10">
                  <p className="text-[var(--brand-muted-lavender)] text-sm text-center mb-4 font-body">
                    Ready to create magic? Generation takes about 45 seconds.
                  </p>
                  <Button onClick={onGenerate} text="Generate Pawtrait" className="w-full py-5 text-2xl" />
                  {error && <p className="text-center text-red-400 mt-3">{error}</p>}
                </div>
              </div>
            </div>
          )}

          {appStep === "result" && watermarkedImage && (
            <>
              <div className="mt-12 text-center">
                <img src={watermarkedImage} alt="Generated" className="mx-auto max-w-full rounded-xl border border-white/10" />
                {typeof likenessScore === "number" && (
                  <p className="mt-3 text-sm text-[var(--brand-muted-lavender)]">Likeness score: {likenessScore}</p>
                )}
                <div className="mt-6 flex gap-4 justify-center">
                  <button
                    onClick={() => navigate("/product")}
                    disabled={!canContinue}
                    className="inline-block rounded-full bg-[var(--brand-accent-orange)] px-8 py-4 text-lg font-heading font-bold text-slate-950 hover:opacity-90 transition-all disabled:opacity-40"
                  >
                    Select Product & Checkout
                  </button>
                </div>
              </div>

              <RefinementPanel selectedStyle={selectedStyle} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

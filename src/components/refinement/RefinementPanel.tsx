import React, { useState } from "react";
import { usePawtraitStore } from "../../store/usePawtraitStore";
import { buildPrompt } from "../../store/utils";
import * as geminiService from "../../services/geminiService";
import { Button } from "../Button";
import type { Style } from "../../data/styles";


const MAX_REFINES = 2;

export const RefinementPanel: React.FC<{ selectedStyle: Style | null }> = ({ selectedStyle }) => {
  const {
    originalImage,
    highResGeneratedImage,
    watermarkedImage,
    petName,
    background,
    setGenerated,
  } = usePawtraitStore();

  const toast = useToast();

  const [refineDraft, setRefineDraft] = useState("");
  const [inFlight, setInFlight] = useState(false);
  const [count, setCount] = useState(0);
  const [staged, setStaged] = useState<{ img: string; wm: string } | null>(null);
  const canRefine = count < MAX_REFINES;

  async function handleRefineSubmit() {
    if (!canRefine) return;
    if (!selectedStyle) {
      toast.error("Pick a style first.");
      return;
    }
    const base = highResGeneratedImage || originalImage;
    if (!base) {
      toast.error("Upload an image first.");
      return;
    }
    if (!refineDraft.trim()) {
      toast.info("Tell me what to change before refining.");
      return;
    }

    setInFlight(true);
    try {
      const prompt = buildPrompt(selectedStyle, petName, background, refineDraft);
      const gen = await geminiService.generatePetPortrait({
        prompt,
        imageBase64: base,
        styleId: selectedStyle.id,
        petName,
        email: ""
      });
      if (!gen.ok) throw new Error(gen.error || "Refinement failed");
      const generated = gen.data.imageBase64;
      if (!generated) throw new Error("No image returned");

      const wm = await geminiService.addWatermark(generated);
      setStaged({ img: generated, wm });
      toast.success("Refinement ready to review.");
    } catch (e: any) {
      toast.error(e?.message || "Refinement failed");
    } finally {
      setInFlight(false);
    }
  }

  function accept() {
    if (!staged) return;
    setGenerated(staged.img, staged.wm, null);
    setStaged(null);
    setRefineDraft("");
    setCount(c => Math.min(MAX_REFINES, c + 1));
    toast.success("Refinement applied.");
  }

  function discard() {
    setStaged(null);
    toast.info("Changes discarded.");
  }

  return (
    <div className="p-8 rounded-3xl border border-white/10 bg-black/20 mt-10">
      <div className="flex justify-between items-baseline mb-6">
        <h3 className="font-heading text-white text-xl">Make Adjustments</h3>
        <span
          className={`text-xs font-bold px-3 py-1.5 rounded-full border ${canRefine ? 'border-[var(--brand-accent-orange)] text-[var(--brand-accent-orange)]' : 'border-white/30 text-white/50'}`}
        >
          {MAX_REFINES - count} Refinements Left
        </span>
      </div>

      <div className="space-y-4 font-body text-[var(--brand-muted-lavender)] text-sm mb-6">
        <p>Guide the AI toward a specific result. Be concrete and visual.</p>
        <ul className="list-disc pl-5 space-y-2 opacity-80">
          <li><strong>Correct features:</strong> darker eyes, add white chest patch, etc.</li>
          <li><strong>Mood/lighting:</strong> warmer golden light, softer shadows.</li>
          <li><strong>Style tweak:</strong> more visible brushstrokes.</li>
        </ul>
      </div>

      <div className="flex flex-col gap-4">
        <textarea
          value={refineDraft}
          onChange={(e) => setRefineDraft(e.target.value)}
          placeholder="Describe exactly what you want to change..."
          rows={4}
          disabled={!canRefine || inFlight}
          className="w-full p-4 bg-black/30 border-2 border-white/10 rounded-xl font-body text-white placeholder-white/30 focus:border-[var(--brand-accent-orange)] focus:outline-none resize-none transition-colors disabled:opacity-50"
        />
        <Button
          onClick={handleRefineSubmit}
          text={inFlight ? "Applying Refinements..." : "Generate Refinement"}
          disabled={!canRefine || inFlight || !refineDraft.trim() || !selectedStyle}
          className="w-full py-3"
        />
        {!canRefine && (
          <p className="text-center text-xs text-red-400 mt-2">You have used all available refinements for this session.</p>
        )}
      </div>

      {staged && (
        <div className="mt-6 p-4 bg-black/40 backdrop-blur-md rounded-xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white font-heading mb-2 sm:mb-0">Reviewing refinement...</p>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="secondary" onClick={discard} text="Discard Changes" className="text-sm py-2" />
            <Button onClick={accept} text="Keep This Version" className="text-sm py-2 bg-emerald-600 hover:bg-emerald-500" />
          </div>
        </div>
      )}
    </div>
  );
};

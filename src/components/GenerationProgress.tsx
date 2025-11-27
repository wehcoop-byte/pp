import React, { useEffect, useState } from "react";

export type StepKey = "PREPARING" | "GENERATING" | "CRITIQUING" | "FINISHING";

interface GenerationProgressProps {
  currentStep: StepKey;
  message?: string; // Optional override from parent
}

// --- Icons ---

const CheckIcon = () => (
  <div className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 border border-emerald-500 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.4)]">
    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
    </svg>
  </div>
);

const SpinnerIcon = () => (
  <div className="w-8 h-8 flex items-center justify-center relative">
    <div className="absolute inset-0 rounded-full border-2 border-[var(--brand-accent-orange)] border-t-transparent animate-spin"></div>
    <div className="w-2 h-2 bg-[var(--brand-accent-orange)] rounded-full animate-pulse"></div>
  </div>
);

const PendingIcon = () => (
  <div className="w-8 h-8 flex items-center justify-center border-2 border-white/10 rounded-full bg-white/5">
    <div className="w-2 h-2 bg-white/20 rounded-full"></div>
  </div>
);

// --- Steps Definition ---

const STEPS = [
  { key: "PREPARING", title: "Upload & Prep", desc: "Processing source image" },
  { key: "GENERATING", title: "AI Generation", desc: "Creating artwork" },
  { key: "CRITIQUING", title: "Likeness Check", desc: " verifying identity" },
  { key: "FINISHING", title: "Final Polish", desc: "Watermarking preview" },
] as const;

// --- Detailed Simulated Messages for Long Waits ---

const GENERATION_LOGS = [
  "Connecting to secure GPU cluster...",
  "Analyzing facial structure and markings...",
  "Engaging Gemini vision model...",
  "Generating initial composition...",
  "Applying artistic style transfer...",
  "Calculating likeness score...",
  "Likeness threshold not met. Adjusting weights...",
  "Regenerating artwork (Attempt 2)...",
  "Refining fur texture details...",
  "Likeness confirmed. Upscaling...",
];

export const GenerationProgress: React.FC<GenerationProgressProps> = ({ currentStep }) => {
  const [logIndex, setLogIndex] = useState(0);
  const currentStepIndex = STEPS.findIndex((s) => s.key === currentStep);

  // Timer to cycle through detailed messages during the long "GENERATING" phase
  useEffect(() => {
    if (currentStep === "GENERATING") {
      const interval = setInterval(() => {
        setLogIndex((prev) => (prev < GENERATION_LOGS.length - 1 ? prev + 1 : prev));
      }, 4500); // Change text every 4.5 seconds
      return () => clearInterval(interval);
    } else {
      setLogIndex(0); // Reset if we move to another step
    }
  }, [currentStep]);

  // Helper to get the display message
  const getDetailMessage = (stepKey: string, defaultDesc: string) => {
    if (stepKey === "GENERATING") return GENERATION_LOGS[logIndex];
    return defaultDesc;
  };

  return (
    <div className="w-full max-w-lg p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl animate-fade-in">
      <h2 className="text-2xl font-heading text-center text-[var(--brand-soft-white)] mb-8 tracking-wide">
        Creating Masterpiece
      </h2>

      <div className="space-y-6 relative">
        {/* Vertical connecting line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-white/10 -z-10" />

        {STEPS.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          const isPending = index > currentStepIndex;

          return (
            <div
              key={step.key}
              className={`flex items-center gap-5 transition-all duration-500 ${
                isCurrent ? "scale-105 translate-x-2" : "opacity-60"
              }`}
            >
              <div className="flex-shrink-0 z-10 bg-[#1a1a2e]">
                {isCompleted ? <CheckIcon /> : isCurrent ? <SpinnerIcon /> : <PendingIcon />}
              </div>
              
              <div className="flex-grow">
                <h3
                  className={`font-heading text-lg ${
                    isCurrent ? "text-[var(--brand-accent-orange)]" : "text-white"
                  }`}
                >
                  {step.title}
                </h3>
                <p className={`text-sm font-body leading-relaxed ${isCurrent ? "text-white/90" : "text-white/40"}`}>
                  {isCurrent ? getDetailMessage(step.key, step.desc) : step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress Bar for the active step (Visual flair) */}
      {currentStep === "GENERATING" && (
        <div className="mt-8">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--brand-accent-orange)] to-yellow-400 animate-progress-indeterminate"
              style={{ width: '30%' }} 
            />
          </div>
          <p className="text-center text-xs text-white/30 mt-2 font-mono">
            Process ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}
          </p>
        </div>
      )}
    </div>
  );
};
import React, { useEffect, useMemo, useState } from "react";
import { ProgressRing } from "../ui/ProgressRing";

export type GenStep = {
  key: string;
  label: string;
  weight?: number; // contribution toward total progress, default equal weights
};

type Props = {
  steps?: GenStep[];
  activeKey: string;
  sublabel?: string;
};

const DEFAULT_STEPS: GenStep[] = [
  { key: "PREPARING", label: "Preparing your pawtrAIt", weight: 15 },
  { key: "GENERATING", label: "Generating portrait", weight: 55 },
  { key: "FINISHING", label: "Watermarking", weight: 20 },
  { key: "READY", label: "Ready", weight: 10 }
];

export const GeneratingSequence: React.FC<Props> = ({ steps = DEFAULT_STEPS, activeKey, sublabel }) => {
  const [progress, setProgress] = useState(4);

  const weights = useMemo(() => {
    const total = steps.reduce((s, st) => s + (st.weight ?? 1), 0);
    let acc = 0;
    const map: Record<string, [number, number]> = {};
    for (const st of steps) {
      const w = st.weight ?? 1;
      const start = (acc / total) * 100;
      acc += w;
      const end = (acc / total) * 100;
      map[st.key] = [start, end];
    }
    return map;
  }, [steps]);

  useEffect(() => {
    const bounds = weights[activeKey] ?? [0, 95];
    const [start, end] = bounds;
    setProgress(p => Math.max(p, start + 1)); // never go backwards
    const id = window.setInterval(() => {
      setProgress(p => {
        if (p >= end - 1) return p;
        return p + Math.max(0.4, (end - p) * 0.06);
      });
    }, 90);
    return () => window.clearInterval(id);
  }, [activeKey, weights]);

  return (
    <div className="w-full max-w-xl mx-auto bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl">
      <div className="flex items-center gap-6">
        <ProgressRing size={80} stroke={8} progress={progress} />
        <div className="flex-1">
          <div className="font-heading text-white text-lg">{steps.find(s => s.key === activeKey)?.label || "Working..."}</div>
          {sublabel && <div className="text-sm text-white/70 mt-1">{sublabel}</div>}
          <div className="mt-4 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-[var(--brand-accent-orange)] transition-all" style={{ width: \`\${progress}%\` }} />
          </div>
        </div>
      </div>

      <ol className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((s) => {
          const [start, end] = weights[s.key] ?? [0,0];
          const done = progress >= end - 1;
          const active = activeKey === s.key;
          return (
            <li key={s.key} className={\`text-xs font-heading px-3 py-2 rounded-lg border \${done ? 'border-emerald-400/40 text-emerald-300 bg-emerald-500/10' : active ? 'border-white/30 text-white' : 'border-white/10 text-white/60'}\`}>
              {s.label}
            </li>
          );
        })}
      </ol>
    </div>
  );
};

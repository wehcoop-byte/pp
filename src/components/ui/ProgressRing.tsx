import React, { useMemo } from "react";

type Props = {
  size?: number;        // px
  stroke?: number;      // px
  progress: number;     // 0..100
  className?: string;
  showLabel?: boolean;
};

export const ProgressRing: React.FC<Props> = ({ size = 96, stroke = 8, progress, className = "", showLabel = true }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const dash = useMemo(() => Math.max(0, Math.min(100, progress)) / 100 * circ, [progress, circ]);

  return (
    <div className={\`relative inline-block \${className}\`} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={\`0 0 \${size} \${size}\`}>
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="rgba(255,255,255,0.15)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size/2}
          cy={size/2}
          r={radius}
          stroke="var(--brand-accent-orange)"
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={\`\${dash} \${circ}\`}
          transform={\`rotate(-90 \${size/2} \${size/2})\`}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 grid place-items-center text-sm font-heading text-white">
          {Math.round(Math.max(0, Math.min(100, progress)))}%
        </div>
      )}
    </div>
  );
};

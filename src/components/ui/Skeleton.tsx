import React from "react";

type LineProps = { width?: string; className?: string };
export const SkeletonLine: React.FC<LineProps> = ({ width = "100%", className = "" }) => (
  <div className={\`animate-pulse rounded bg-white/10 h-3 \${className}\`} style={{ width }} />
);

type BlockProps = { className?: string; height?: string };
export const SkeletonBlock: React.FC<BlockProps> = ({ className = "", height = "200px" }) => (
  <div className={\`animate-pulse rounded-xl bg-white/10 \${className}\`} style={{ height }} />
);

import React from "react";

type Props = {
  size?: "sm" | "md" | "lg";
};

export const LoadingSpinner: React.FC<Props> = ({ size = "md" }) => {
  const dimension =
    size === "sm" ? "h-5 w-5" :
    size === "lg" ? "h-12 w-12" :
    "h-8 w-8";

  return (
    <div className="flex items-center justify-center">
      <div className={\`relative \${dimension}\`}>
        <div className="absolute inset-0 rounded-full border-4 border-white/10" />
        <div
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-[var(--brand-accent-orange)] animate-spin"
          style={{ animationDuration: "0.9s" }}
        />
      </div>
    </div>
  );
};

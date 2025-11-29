import React from "react";
import { SkeletonLine, SkeletonBlock } from "./Skeleton";

export const FullPageSkeleton: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-10">
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
        {/* Left column */}
        <div className="lg:col-span-5 space-y-6">
          <SkeletonBlock height="420px" />
          <div className="space-y-4">
            <SkeletonLine width="40%" />
            <SkeletonLine width="70%" />
            <SkeletonLine width="55%" />
          </div>
        </div>
        {/* Right column */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <SkeletonLine width="50%" className="h-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonBlock key={i} height="90px" />
              ))}
            </div>
          </div>
          <SkeletonBlock height="72px" />
        </div>
      </div>
    </div>
  );
};

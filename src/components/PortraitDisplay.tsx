import React, { useState } from "react";

type Props = {
  originalImage: string;
  generatedImage: string;
  likenessScore?: number | null;
  captionLeft?: string;
  captionRight?: string;
};

export const PortraitDisplay: React.FC<Props> = ({
  originalImage,
  generatedImage,
  likenessScore,
  captionLeft = "Original",
  captionRight = "Generated",
}) => {
  const [pos, setPos] = useState(50);

  return (
    <div className="w-full flex justify-center">
      {/* 1. aspect-square: Forces a 1:1 box so it doesn't collapse.
         2. min-h-[300px]: Ensures visibility on small screens.
         3. w-full: Allows it to fill the container (removed max-w-3xl).
      */}
      <div className="relative w-full aspect-square min-h-[300px] select-none rounded-2xl overflow-hidden border border-white/10 bg-black/20 shadow-2xl group">
        
        {/* LAYER 1: Generated Image (Background) */}
        <img
          src={generatedImage}
          alt="Generated"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none" 
        />

        {/* LAYER 2: Original Image (Foreground with Clip Path) 
            We use clip-path instead of width to prevent the image from squishing.
        */}
        <img
          src={originalImage}
          alt="Original"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ 
            clipPath: `polygon(0 0, ${pos}% 0, ${pos}% 100%, 0 100%)` 
          }}
        />

        {/* DIVIDER LINE */}
        <div 
          className="absolute top-0 bottom-0 w-0.5 bg-white/50 pointer-events-none shadow-[0_0_10px_rgba(0,0,0,0.5)]"
          style={{ left: `${pos}%` }}
        />

        {/* SLIDER HANDLE */}
        <div className="absolute left-0 right-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent z-20">
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(Number(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
            aria-label="Compare slider"
          />
          <div className="mt-1 flex justify-between text-xs font-bold text-white drop-shadow-md uppercase tracking-wider opacity-80">
            <span>{captionLeft}</span>
            <span>{captionRight}</span>
          </div>
        </div>

        {/* SCORE BADGE */}
        {typeof likenessScore === "number" && (
          <div className="absolute top-4 right-4 z-30 text-xs font-bold bg-black/60 text-white px-3 py-1.5 rounded-full border border-white/20 backdrop-blur-md shadow-lg">
            Likeness: {Math.round(likenessScore * 100)}%
          </div>
        )}
      </div>
    </div>
  );
};
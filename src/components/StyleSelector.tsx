import React, { useEffect, useMemo, useRef, useState } from "react";
import { Style } from "../data/styles";
import { motion } from "framer-motion";

interface StyleSelectorProps {
  styles: Style[];
  selectedStyle: Style | null;
  onSelectStyle: (style: Style) => void;
}

export const StyleSelector: React.FC<StyleSelectorProps> = ({
  styles,
  selectedStyle,
  onSelectStyle
}) => {
  const [focusIndex, setFocusIndex] = useState<number>(0);
  const gridRef = useRef<HTMLDivElement>(null);

  const items = useMemo(() => styles ?? [], [styles]);

  useEffect(() => {
    const idx = Math.max(
      0,
      items.findIndex(s => s.id === selectedStyle?.id)
    );
    if (idx >= 0) setFocusIndex(idx);
  }, [selectedStyle, items]);

  const onKey = (e: React.KeyboardEvent) => {
    if (!gridRef.current) return;
    const cols =
      getComputedStyle(gridRef.current).gridTemplateColumns.split(" ").length ||
      2;
    let next = focusIndex;

    switch (e.key) {
      case "ArrowRight":
        next = Math.min(items.length - 1, focusIndex + 1);
        break;
      case "ArrowLeft":
        next = Math.max(0, focusIndex - 1);
        break;
      case "ArrowDown":
        next = Math.min(items.length - 1, focusIndex + cols);
        break;
      case "ArrowUp":
        next = Math.max(0, focusIndex - cols);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (items[next]) onSelectStyle(items[next]);
        return;
      default:
        return;
    }
    e.preventDefault();
    setFocusIndex(next);
    const btn = gridRef.current.querySelectorAll<HTMLButtonElement>(
      "[data-style-btn]"
    )[next];
    btn?.focus();
  };

  return (
    <div className="w-full">
      <div
        ref={gridRef}
        onKeyDown={onKey}
        role="listbox"
        aria-label="Select a style"
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5"
      >
        {items.map((style, i) => {
          const isSelected = selectedStyle?.id === style.id;
          const isNew =
            (style as any).isNew ||
            /pencil/i.test(style.name) ||
            style.id === "pencil";

          return (
            <motion.button
              key={style.id}
              data-style-btn
              role="option"
              aria-selected={isSelected}
              aria-label={`Select style: ${style.name}`}
              onClick={() => onSelectStyle(style)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={[
                "relative aspect-square rounded-2xl overflow-hidden text-left group",
                "transition-all duration-300",
                "border",
                isSelected
                  ? "border-[var(--brand-orange)] ring-2 ring-[var(--brand-orange)]/60 shadow-[0_0_25px_-5px_rgba(244,149,62,0.6)]"
                  : "border-white/10 hover:border-white/25",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
              ].join(" ")}
            >
              {/* Thumbnail or placeholder */}
              {style.thumbnailUrl ? (
                <img
                  src={style.thumbnailUrl}
                  alt={style.name}
                  className="absolute inset-0 w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 w-full h-full bg-white/5 grid place-items-center">
                  <div className="text-xs opacity-80">No preview</div>
                </div>
              )}

              {/* Gradient overlay */}
              <div
                className={[
                  "absolute inset-0 bg-gradient-to-t from-[#351B41]/90 to-transparent",
                  "transition-opacity duration-300",
                  isSelected ? "opacity-70" : "opacity-80 group-hover:opacity-70"
                ].join(" ")}
              />

              {/* New badge */}
              {isNew && (
                <div className="absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide"
                     style={{ background: "rgba(244,149,62,.95)", color: "#1a0e24" }}>
                  NEW
                </div>
              )}

              {/* Label */}
              <div className="absolute bottom-0 left-0 right-0 p-3 text-center">
                <p
                  className={[
                    "font-heading text-sm font-bold tracking-wide",
                    isSelected
                      ? "text-[var(--brand-orange)]"
                      : "text-white drop-shadow"
                  ].join(" ")}
                >
                  {style.name}
                </p>
                {style.description && (
                  <p className="text-[11px] opacity-85 mt-0.5 line-clamp-2">
                    {style.description}
                  </p>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

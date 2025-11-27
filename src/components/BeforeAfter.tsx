import React, { useRef, useState } from "react";

export default function BeforeAfter({ beforeSrc, afterSrc }:{
  beforeSrc:string; afterSrc:string;
}){
  const [x, setX] = useState(50);
  const wrap = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent) => {
    if (!wrap.current) return;
    const rect = wrap.current.getBoundingClientRect();
    const pct = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    setX(pct);
  };

  return (
    <div ref={wrap} onMouseMove={onMove} className="relative w-full h-64 md:h-80 rounded-2xl overflow-hidden glass select-none">
      <img src={afterSrc} className="absolute inset-0 w-full h-full object-cover" alt="after"/>
      <div style={{ width: `${x}%` }} className="absolute inset-y-0 left-0 overflow-hidden">
        <img src={beforeSrc} className="w-full h-full object-cover" alt="before"/>
      </div>
      <div className="absolute inset-y-0" style={{ left: `calc(${x}% - 1px)` }}>
        <div className="w-0.5 h-full bg-white/70" />
        <div className="absolute top-1/2 -translate-y-1/2 -left-4 right-0 text-xs bg-black/40 px-2 py-1 rounded">drag</div>
      </div>
    </div>
  );
}

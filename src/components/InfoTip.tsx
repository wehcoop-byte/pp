import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function InfoTip({ label = "More info", children }: { label?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("click", onDoc);
    return () => document.removeEventListener("click", onDoc);
  }, []);

  return (
    <div ref={ref} className="relative inline-flex items-center">
      <button aria-label={label} className="ml-2 h-5 w-5 rounded-full text-[12px] leading-[18px] text-center glass"
              onClick={() => setOpen(!open)}>i</button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute left-1/2 -translate-x-1/2 top-7 z-50 min-w-[220px] max-w-[320px] glass rounded-xl p-3 text-sm">
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

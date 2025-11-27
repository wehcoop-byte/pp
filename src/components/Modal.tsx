import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ open, onClose, title, children }:{
  open:boolean; onClose:()=>void; title:string; children:React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/50" onClick={onClose} />
          <motion.div role="dialog" aria-modal="true"
            className="glass relative max-w-lg w-full rounded-2xl p-6"
            initial={{ scale: 0.96, y: 8, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.96, y: 8, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg font-semibold">{title}</h3>
              <button onClick={onClose} aria-label="Close" className="px-2 py-1 rounded-md hover:bg-white/10">✕</button>
            </div>
            <div className="mt-3 text-sm opacity-90">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

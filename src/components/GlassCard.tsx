import React from "react";
import { motion } from "framer-motion";

type Props = { children: React.ReactNode; className?: string; hover?: boolean };

export default function GlassCard({ children, className = "", hover = true }: Props) {
  return (
    <motion.div
      className={`glass rounded-2xl p-5 md:p-6 ${className}`}
      whileHover={hover ? { y: -2, boxShadow: "0 0 40px rgba(244,149,62,.20)" } : undefined}
      transition={{ type: "spring", stiffness: 220, damping: 24 }}
    >
      {children}
    </motion.div>
  );
}

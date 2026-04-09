"use client";

import { motion } from "framer-motion";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export function GlassCard({ children, className = "", hover = true }: GlassCardProps) {
  return (
    <motion.div
      className={`relative rounded-2xl border border-surface-border bg-surface backdrop-blur-md overflow-hidden ${className}`}
      whileHover={hover ? { scale: 1.02, borderColor: "rgba(168, 85, 247, 0.2)" } : undefined}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

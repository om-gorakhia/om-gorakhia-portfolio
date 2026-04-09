"use client";

import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { resume } from "@/data/resume";

const Scene = dynamic(
  () => import("@/components/scene/Scene").then((mod) => mod.Scene),
  { ssr: false }
);

interface HeroProps {
  onAvatarClick: () => void;
  transmissionProgress: number;
}

export function Hero({ onAvatarClick, transmissionProgress }: HeroProps) {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Scene Background */}
      <div className="absolute inset-0 z-0">
        <Scene
          onAvatarClick={onAvatarClick}
          transmissionProgress={transmissionProgress}
        />
      </div>

      {/* Hero overlay content */}
      <div className="relative z-10 flex flex-col items-center text-center pointer-events-none px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <MonoLabel className="mb-4 block">sys.operator.identify</MonoLabel>
        </motion.div>

        <motion.h1
          className="font-mono text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
        >
          <span className="text-foreground">{resume.fullName}</span>
        </motion.h1>

        <motion.p
          className="font-sans text-lg md:text-xl text-muted max-w-xl leading-relaxed"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
        >
          {resume.tagline}
        </motion.p>

        <motion.div
          className="mt-8 flex gap-4 pointer-events-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 1.3 }}
        >
          <a
            href="#work"
            className="font-mono text-sm border border-accent/30 rounded-lg px-5 py-2.5 text-accent-light hover:bg-accent/10 transition-colors"
          >
            view.work()
          </a>
          <a
            href="#contact"
            className="font-mono text-sm bg-accent/20 border border-accent/40 rounded-lg px-5 py-2.5 text-accent-light hover:bg-accent/30 transition-colors"
          >
            init.contact()
          </a>
        </motion.div>

        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 2, duration: 0.6 },
            y: { delay: 2, duration: 2, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 5v14M19 12l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>
    </section>
  );
}

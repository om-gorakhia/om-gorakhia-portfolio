"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Hero } from "@/components/panels/Hero";
import { NowStrip } from "@/components/panels/NowStrip";
import { SelectedWork } from "@/components/panels/SelectedWork";
import { Timeline } from "@/components/panels/Timeline";
import { Contact } from "@/components/panels/Contact";
import { ScanLineOverlay } from "@/components/ui/ScanLineOverlay";
import type { Repo } from "@/lib/types";

interface PageClientProps {
  repos: Repo[];
  commit: {
    repo: string;
    message: string;
    date: string;
    language: string;
  };
}

export function PageClient({ repos, commit }: PageClientProps) {
  const [transmissionActive, setTransmissionActive] = useState(false);

  const handleAvatarClick = useCallback(() => {
    setTransmissionActive(true);
    // Scroll to top so the camera push-in is visible
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleExitTransmission = useCallback(() => {
    setTransmissionActive(false);
  }, []);

  // ESC key to exit transmission
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && transmissionActive) {
        setTransmissionActive(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [transmissionActive]);

  return (
    <main className="relative">
      <ScanLineOverlay />

      <AnimatePresence>
        {transmissionActive && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Backdrop — lets the 3D scene camera animation show through briefly */}
            <motion.div
              className="absolute inset-0 bg-background/90 backdrop-blur-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            />

            <motion.div
              className="relative w-full max-w-3xl px-6 z-10"
              initial={{ scale: 0.85, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              <div className="flex items-center justify-between mb-6">
                <motion.div
                  className="font-mono text-sm text-accent-light"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 }}
                >
                  ▸ TRANSMISSION MODE ACTIVE
                </motion.div>
                <motion.button
                  onClick={handleExitTransmission}
                  className="font-mono text-xs text-foreground/40 hover:text-foreground transition-colors border border-surface-border rounded px-3 py-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  ESC — exit
                </motion.button>
              </div>
              <Contact />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Hero
        onAvatarClick={handleAvatarClick}
        transmissionProgress={transmissionActive ? 1 : 0}
        transmissionActive={transmissionActive}
      />
      <NowStrip commit={commit} />
      <SelectedWork repos={repos} />
      <Timeline />
      <Contact />

      <footer className="border-t border-surface-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs text-foreground/60">
            © {new Date().getFullYear()} Om Gorakhia
          </span>
          <span className="font-mono text-xs text-foreground/55">
            sys.uptime: ∞
          </span>
        </div>
      </footer>
    </main>
  );
}

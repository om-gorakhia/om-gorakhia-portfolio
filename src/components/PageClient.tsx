"use client";

import { useState, useCallback } from "react";
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
    setTimeout(() => {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    }, 600);
  }, []);

  const handleExitTransmission = useCallback(() => {
    setTransmissionActive(false);
  }, []);

  return (
    <main className="relative">
      <ScanLineOverlay />

      <AnimatePresence>
        {transmissionActive && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="w-full max-w-3xl px-6"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <div className="font-mono text-sm text-accent-light">
                  ▸ TRANSMISSION MODE ACTIVE
                </div>
                <button
                  onClick={handleExitTransmission}
                  className="font-mono text-xs text-foreground/40 hover:text-foreground transition-colors border border-surface-border rounded px-3 py-1"
                >
                  ESC — exit
                </button>
              </div>
              <Contact />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Hero
        onAvatarClick={handleAvatarClick}
        transmissionProgress={transmissionActive ? 1 : 0}
      />
      <NowStrip commit={commit} />
      <SelectedWork repos={repos} />
      <Timeline />
      <Contact />

      <footer className="border-t border-surface-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <span className="font-mono text-xs text-foreground/50">
            © {new Date().getFullYear()} Om Gorakhia
          </span>
          <span className="font-mono text-xs text-foreground/40">
            sys.uptime: ∞
          </span>
        </div>
      </footer>
    </main>
  );
}

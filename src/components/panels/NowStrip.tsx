"use client";

import { motion } from "framer-motion";
import { MonoLabel } from "@/components/ui/MonoLabel";

interface NowStripProps {
  commit: {
    repo: string;
    message: string;
    date: string;
    language: string;
  };
}

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  if (diffHours > 0) return `${diffHours}h ago`;
  return "just now";
}

export function NowStrip({ commit }: NowStripProps) {
  return (
    <motion.section
      className="relative border-y border-surface-border bg-surface/50 backdrop-blur-sm py-4 overflow-hidden"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-5xl mx-auto px-6 flex items-center gap-4 flex-wrap md:flex-nowrap">
        <div className="flex items-center gap-2 shrink-0">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent" />
          </span>
          <MonoLabel>live.now</MonoLabel>
        </div>

        <div className="font-mono text-sm text-foreground/80 flex items-center gap-3 overflow-hidden">
          <span className="text-accent-light shrink-0">{commit.repo}</span>
          <span className="text-foreground/40 hidden sm:inline">→</span>
          <span className="truncate text-foreground/60 hidden sm:inline">
            &quot;{commit.message}&quot;
          </span>
        </div>

        <div className="ml-auto flex items-center gap-3 shrink-0">
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-light border border-accent/20">
            {commit.language}
          </span>
          <span className="font-mono text-xs text-foreground/40">
            {timeAgo(commit.date)}
          </span>
        </div>
      </div>
    </motion.section>
  );
}

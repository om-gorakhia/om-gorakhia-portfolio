"use client";

import { motion } from "framer-motion";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { selectedRepos } from "@/data/github";
import type { Repo } from "@/lib/types";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  return "today";
}

function RepoCard({ repo, index }: { repo: Repo; index: number }) {
  // Alternate tilt directions for visual interest
  const tiltX = index % 2 === 0 ? 2 : -2;
  const tiltY = index % 3 === 0 ? -1 : 1;

  return (
    <motion.a
      href={repo.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      initial={{ opacity: 0, y: 40, rotateX: 5 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      whileHover={{
        y: -8,
        rotateX: tiltX,
        rotateY: tiltY,
        transition: { duration: 0.25 },
      }}
      style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
    >
      <div className="relative rounded-2xl border border-surface-border bg-surface/80 backdrop-blur-md p-6 overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] group-hover:border-accent/20">
        {/* Accent glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-mono text-base font-semibold text-foreground group-hover:text-accent-light transition-colors">
              {repo.name}
            </h3>
            <svg
              className="w-4 h-4 text-foreground/30 group-hover:text-accent-light transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path d="M7 17L17 7M17 7H7M17 7v10" />
            </svg>
          </div>

          {/* Description */}
          <p className="text-sm text-foreground/60 leading-relaxed mb-4 line-clamp-2">
            {repo.description}
          </p>

          {/* Footer */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-light border border-accent/20">
              {repo.language}
            </span>
            {repo.stars > 0 && (
              <span className="flex items-center gap-1 text-xs text-foreground/40">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {repo.stars}
              </span>
            )}
            <span className="text-xs text-foreground/30 ml-auto font-mono">
              {timeAgo(repo.pushedAt)}
            </span>
          </div>
        </div>
      </div>
    </motion.a>
  );
}

export function SelectedWork() {
  return (
    <section id="work" className="relative py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <MonoLabel className="mb-3 block">ls ~/projects --sort=signal</MonoLabel>
          <h2 className="font-mono text-3xl md:text-4xl font-bold">
            Selected Work
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {selectedRepos.map((repo, i) => (
            <RepoCard key={repo.name} repo={repo} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

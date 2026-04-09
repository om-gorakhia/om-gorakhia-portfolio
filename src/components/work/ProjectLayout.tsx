"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { ScanLineOverlay } from "@/components/ui/ScanLineOverlay";
import type { ProjectDetail } from "@/data/projects";
import { projectSlugs } from "@/data/projects";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 30) return `${Math.floor(diffDays / 30)}mo ago`;
  if (diffDays > 0) return `${diffDays}d ago`;
  return "today";
}

function getAdjacentSlugs(slug: string) {
  const idx = projectSlugs.indexOf(slug);
  return {
    prev: idx > 0 ? projectSlugs[idx - 1] : null,
    next: idx < projectSlugs.length - 1 ? projectSlugs[idx + 1] : null,
  };
}

export function ProjectLayout({
  project,
  stars,
  pushedAt,
  simulationId,
  children,
}: {
  project: ProjectDetail;
  stars: number;
  pushedAt: string;
  simulationId: string;
  children: React.ReactNode;
}) {
  const { prev, next } = getAdjacentSlugs(project.slug);

  return (
    <main className="relative min-h-screen">
      <ScanLineOverlay />

      {/* Breadcrumb panel */}
      <motion.div
        className="fixed top-4 left-4 z-40"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Link
          href="/#work"
          className="group flex items-center gap-2 rounded-xl border border-surface-border bg-surface/80 backdrop-blur-md px-3 py-2 hover:border-accent/30 transition-colors"
        >
          <svg
            className="w-4 h-4 text-foreground/55 group-hover:text-accent-light transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-mono text-xs text-foreground/60 group-hover:text-accent-light transition-colors">
            {project.title}
          </span>
        </Link>
      </motion.div>

      <div className="max-w-5xl mx-auto px-6 pt-20 pb-24">
        {/* Header panel */}
        <motion.div
          layoutId={`card-${project.slug}`}
          className="mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <MonoLabel className="mb-3 block">
            cat ~/projects/{project.slug}/README.md
          </MonoLabel>
          <h1 className="font-mono text-3xl md:text-5xl font-bold mb-3">
            {project.title}
          </h1>
          <p className="text-foreground/60 text-lg leading-relaxed max-w-2xl mb-6">
            {project.description}
          </p>

          <div className="flex items-center gap-3 flex-wrap">
            <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-accent/10 text-accent-light border border-accent/20">
              {project.language}
            </span>
            {stars > 0 && (
              <span className="flex items-center gap-1 text-xs text-foreground/55 font-mono">
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {stars}
              </span>
            )}
            <span className="text-xs text-foreground/60 font-mono">
              pushed {timeAgo(pushedAt)}
            </span>
            <div className="flex gap-2 ml-auto">
              <a
                href={`#${simulationId}`}
                className="font-mono text-xs px-4 py-2 rounded-lg bg-accent text-white hover:bg-accent-dark transition-colors"
              >
                run.demo()
              </a>
              <a
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs px-4 py-2 rounded-lg border border-surface-border text-foreground/60 hover:border-accent/30 hover:text-accent-light transition-colors"
              >
                view.source() ↗
              </a>
            </div>
          </div>
        </motion.div>

        {/* Context strip */}
        <motion.div
          className="flex gap-2 mb-12 flex-wrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-surface-border bg-surface/80 text-foreground/60">
            {project.domain}
          </span>
          {project.techniques.map((t) => (
            <span
              key={t}
              className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-surface-border bg-surface/80 text-foreground/60"
            >
              {t}
            </span>
          ))}
          <span className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-surface-border bg-surface/80 text-foreground/60">
            {project.datasetScale}
          </span>
          <span className="font-mono text-[11px] px-3 py-1.5 rounded-lg border border-surface-border bg-surface/80 text-foreground/60">
            {project.role}
          </span>
        </motion.div>

        {/* What it does */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <MonoLabel className="mb-4 block">signal.overview</MonoLabel>
          <div className="space-y-4 max-w-3xl">
            {project.whatItDoes.map((para, i) => (
              <p key={i} className="text-foreground/60 leading-relaxed">
                {para}
              </p>
            ))}
          </div>
        </motion.div>

        {/* Simulation */}
        <motion.div
          id={simulationId}
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <MonoLabel className="mb-4 block">run.simulation()</MonoLabel>
          <div className="rounded-2xl border border-surface-border bg-[#0a0b0f] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-surface-border bg-surface/50">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
              </div>
              <span className="font-mono text-[10px] text-foreground/60 ml-2">
                {project.slug} — interactive demo
              </span>
            </div>
            <div className="p-4 md:p-6">{children}</div>
          </div>
        </motion.div>

        {/* How it's built */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <MonoLabel className="mb-4 block">cat ARCHITECTURE.md</MonoLabel>
          <div className="flex gap-2 mb-6 flex-wrap">
            {project.techStack.map((t) => (
              <span
                key={t}
                className="font-mono text-xs px-3 py-1.5 rounded-lg bg-accent/10 text-accent-light border border-accent/20"
              >
                {t}
              </span>
            ))}
          </div>
          <ul className="space-y-3 max-w-3xl">
            {project.architectureNotes.map((note, i) => (
              <li key={i} className="flex gap-3 text-foreground/60 text-sm leading-relaxed">
                <span className="text-accent-light/70 shrink-0 font-mono">▸</span>
                {note}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Navigation */}
        <motion.div
          className="flex items-center justify-between pt-8 border-t border-surface-border"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {prev ? (
            <Link
              href={`/work/${prev}`}
              className="group flex items-center gap-2 font-mono text-sm text-foreground/55 hover:text-accent-light transition-colors"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              {prev.replace(/-/g, " ")}
            </Link>
          ) : (
            <div />
          )}
          {next ? (
            <Link
              href={`/work/${next}`}
              className="group flex items-center gap-2 font-mono text-sm text-foreground/55 hover:text-accent-light transition-colors"
            >
              {next.replace(/-/g, " ")}
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ) : (
            <div />
          )}
        </motion.div>
      </div>

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

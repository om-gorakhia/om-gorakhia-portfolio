"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { MonoLabel } from "@/components/ui/MonoLabel";
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
  const tiltX = index % 2 === 0 ? 2 : -2;
  const tiltY = index % 3 === 0 ? -1 : 1;

  return (
    <motion.div
      className="group relative"
      layoutId={`card-${repo.name}`}
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
      <Link href={`/work/${repo.name}`} className="block">
        <div className="relative rounded-2xl border border-surface-border bg-surface/80 backdrop-blur-md p-6 overflow-hidden transition-shadow duration-300 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] group-hover:border-accent/20">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-mono text-sm font-semibold text-foreground group-hover:text-accent-light transition-colors break-all leading-snug">
                {repo.name}
              </h3>
              <svg
                className="w-4 h-4 text-foreground/30 group-hover:text-accent-light transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 shrink-0 mt-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>

            <p className="text-sm text-foreground/60 leading-relaxed mb-4 line-clamp-2">
              {repo.description}
            </p>

            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-accent/10 text-accent-light border border-accent/20">
                {repo.language}
              </span>
              {repo.stars > 0 && (
                <span className="flex items-center gap-1 text-xs text-foreground/55">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {repo.stars}
                </span>
              )}
              <span className="text-xs text-foreground/60 ml-auto font-mono">
                {timeAgo(repo.pushedAt)}
              </span>
            </div>
            {/* Hover affordance */}
            <div className="mt-3 pt-3 border-t border-surface-border opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span className="font-mono text-[10px] text-accent-light/80 tracking-wider uppercase">
                run simulation →
              </span>
            </div>
          </div>
        </div>
      </Link>

      {/* Small GitHub icon in corner */}
      <a
        href={repo.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View ${repo.name} on GitHub`}
        className="absolute top-3 right-3 z-20 p-1.5 rounded-lg bg-surface/80 border border-surface-border opacity-0 group-hover:opacity-100 transition-opacity hover:border-accent/30"
        onClick={(e) => e.stopPropagation()}
      >
        <svg className="w-3.5 h-3.5 text-foreground/40 hover:text-accent-light transition-colors" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      </a>
    </motion.div>
  );
}

export function SelectedWork({ repos }: { repos: Repo[] }) {
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
          <MonoLabel className="mb-3 block">ls ~/projects --interactive</MonoLabel>
          <h2 className="font-mono text-3xl md:text-4xl font-bold">
            Selected Work
          </h2>
          <p className="text-sm text-foreground/60 mt-2 font-mono">
            Each project has a live, interactive simulation you can play with.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {repos.map((repo, i) => (
            <RepoCard key={repo.name} repo={repo} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

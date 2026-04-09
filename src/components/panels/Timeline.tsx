"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { timeline } from "@/data/resume";

function TimelineCard({
  entry,
  index,
  total,
}: {
  entry: (typeof timeline)[0];
  index: number;
  total: number;
}) {
  // Arc positioning: distribute cards along a gentle curve
  const progress = index / (total - 1);
  const arcY = Math.sin(progress * Math.PI) * -20; // arc peaks in the middle

  return (
    <motion.div
      className="relative flex-shrink-0 w-64 md:w-72"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      style={{ marginTop: `${40 + arcY}px` }}
    >
      {/* Connector line */}
      <div className="absolute -top-4 left-6 w-px h-4 bg-gradient-to-b from-transparent to-accent/40" />

      {/* Node dot */}
      <div className="absolute -top-6 left-5 w-3 h-3 rounded-full border-2 border-accent bg-background" />

      {/* Card */}
      <div className="rounded-xl border border-surface-border bg-surface/60 backdrop-blur-sm p-5 hover:border-accent/20 transition-colors">
        <span className="font-mono text-xs text-accent-light/85 block mb-2">
          {entry.date}
        </span>
        <h3 className="font-mono text-sm font-semibold text-foreground mb-1">
          {entry.title}
        </h3>
        <p className="text-xs text-foreground/60 leading-relaxed">
          {entry.description}
        </p>
      </div>
    </motion.div>
  );
}

export function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const lineWidth = useTransform(scrollYProgress, [0.1, 0.6], ["0%", "100%"]);

  return (
    <section id="timeline" className="relative py-24 px-6" ref={containerRef}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <MonoLabel className="mb-3 block">cat ~/timeline --format=arc</MonoLabel>
          <h2 className="font-mono text-3xl md:text-4xl font-bold">
            Timeline
          </h2>
        </motion.div>

        {/* Horizontal scrollable container */}
        <div className="relative">
          {/* Progress line behind cards */}
          <div className="absolute top-[18px] left-6 right-6 h-px bg-surface-border">
            <motion.div
              className="h-full bg-gradient-to-r from-accent/60 to-accent-light/40"
              style={{ width: lineWidth }}
            />
          </div>

          <div className="overflow-x-auto pb-6 scrollbar-hide">
            <div className="flex gap-5 px-2 min-w-max">
              {timeline.map((entry, i) => (
                <TimelineCard
                  key={entry.date + entry.title}
                  entry={entry}
                  index={i}
                  total={timeline.length}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}

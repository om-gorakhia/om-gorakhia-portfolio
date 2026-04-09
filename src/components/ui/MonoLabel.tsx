"use client";

interface MonoLabelProps {
  children: React.ReactNode;
  className?: string;
}

export function MonoLabel({ children, className = "" }: MonoLabelProps) {
  return (
    <span
      className={`font-mono text-xs uppercase tracking-[0.2em] text-accent-light/70 ${className}`}
    >
      {children}
    </span>
  );
}

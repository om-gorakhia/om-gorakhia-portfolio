"use client";

export const chartColors = {
  accent: "#A855F7",
  accentLight: "#C084FC",
  accentDark: "#7C3AED",
  accentGlow: "rgba(168, 85, 247, 0.4)",
  green: "#22C55E",
  red: "#EF4444",
  amber: "#F59E0B",
  grid: "rgba(255, 255, 255, 0.04)",
  axisText: "rgba(232, 230, 227, 0.4)",
  tooltipBg: "#0d0e14",
  tooltipBorder: "rgba(168, 85, 247, 0.3)",
  surface: "rgba(255, 255, 255, 0.03)",
  surfaceBorder: "rgba(255, 255, 255, 0.06)",
};

export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
  formatter?: (value: number, name: string) => string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-lg border px-3 py-2 font-mono text-xs"
      style={{
        background: chartColors.tooltipBg,
        borderColor: chartColors.tooltipBorder,
      }}
    >
      {label && <div className="text-foreground/40 mb-1">{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: entry.color }}
          />
          <span className="text-foreground/60">{entry.name}:</span>
          <span className="text-foreground">
            {formatter ? formatter(entry.value, entry.name) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function StatTile({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface/80 px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-1">
        {label}
      </div>
      <div
        className={`font-mono text-lg font-semibold ${accent ? "text-accent-light" : "text-foreground"}`}
      >
        {value}
      </div>
    </div>
  );
}

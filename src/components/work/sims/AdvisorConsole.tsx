"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { chartColors, ChartTooltip, StatTile } from "../ChartTheme";

/* ── Risk Profile Dimensions ─────────────────────────────── */
interface RiskProfile {
  capacity: number;    // 1-10 financial capacity
  tolerance: number;   // 1-10 emotional tolerance
  horizon: number;     // years
  liquidity: number;   // 1-10 need for liquidity
  knowledge: number;   // 1-10 investment knowledge
}

const defaultProfile: RiskProfile = {
  capacity: 6,
  tolerance: 5,
  horizon: 10,
  liquidity: 4,
  knowledge: 5,
};

const presets: { label: string; profile: RiskProfile }[] = [
  { label: "Fresh Graduate", profile: { capacity: 3, tolerance: 7, horizon: 30, liquidity: 6, knowledge: 3 } },
  { label: "Mid-Career Pro", profile: { capacity: 7, tolerance: 5, horizon: 15, liquidity: 4, knowledge: 6 } },
  { label: "Pre-Retiree", profile: { capacity: 8, tolerance: 3, horizon: 5, liquidity: 7, knowledge: 7 } },
  { label: "Aggressive Trader", profile: { capacity: 6, tolerance: 9, horizon: 8, liquidity: 3, knowledge: 9 } },
];

/* ── Asset Classes ────────────────────────────────────────── */
interface AssetClass {
  name: string;
  expectedReturn: number;
  volatility: number;
  color: string;
  riskFloor: number; // min risk score to include
}

const assets: AssetClass[] = [
  { name: "Govt Bonds", expectedReturn: 0.04, volatility: 0.03, color: "#22C55E", riskFloor: 0 },
  { name: "Corp Bonds", expectedReturn: 0.06, volatility: 0.06, color: "#3B82F6", riskFloor: 0 },
  { name: "Large Cap Equity", expectedReturn: 0.10, volatility: 0.15, color: chartColors.accentLight, riskFloor: 3 },
  { name: "Mid Cap Equity", expectedReturn: 0.13, volatility: 0.22, color: "#F59E0B", riskFloor: 5 },
  { name: "Small Cap Equity", expectedReturn: 0.16, volatility: 0.30, color: "#EF4444", riskFloor: 7 },
  { name: "Alternatives", expectedReturn: 0.12, volatility: 0.18, color: "#EC4899", riskFloor: 6 },
];

/* ── Scoring & Allocation Engine ─────────────────────────── */
function computeRiskScore(p: RiskProfile): number {
  // Weighted composite: capacity 25%, tolerance 25%, horizon 20%, liquidity (inverse) 15%, knowledge 15%
  const horizonScore = Math.min(p.horizon / 3, 10); // 30yr = 10
  const liquidityInv = 11 - p.liquidity; // invert: high liquidity need = low risk
  const raw = p.capacity * 0.25 + p.tolerance * 0.25 + horizonScore * 0.2 + liquidityInv * 0.15 + p.knowledge * 0.15;
  return Math.round(Math.max(1, Math.min(10, raw)) * 10) / 10;
}

function getRiskBand(score: number): string {
  if (score <= 3) return "Conservative";
  if (score <= 5) return "Moderate";
  if (score <= 7) return "Growth";
  return "Aggressive";
}

function computeAllocation(score: number): { name: string; weight: number; color: string }[] {
  const eligible = assets.filter((a) => score >= a.riskFloor);
  // Higher risk score → tilt toward higher-return assets
  const rawWeights = eligible.map((a) => {
    const riskAffinity = score / 10;
    return Math.pow(a.expectedReturn, riskAffinity) * (1 / a.volatility);
  });
  const total = rawWeights.reduce((s, w) => s + w, 0);
  return eligible.map((a, i) => ({
    name: a.name,
    weight: Math.round((rawWeights[i] / total) * 100),
    color: a.color,
  }));
}

function portfolioStats(allocation: { name: string; weight: number }[]) {
  let expReturn = 0;
  let expVol = 0;
  for (const a of allocation) {
    const asset = assets.find((x) => x.name === a.name)!;
    const w = a.weight / 100;
    expReturn += w * asset.expectedReturn;
    expVol += w * w * asset.volatility * asset.volatility;
  }
  expVol = Math.sqrt(expVol);
  return { expReturn, expVol, sharpe: (expReturn - 0.03) / expVol };
}

/* ── Growth Projection ───────────────────────────────────── */
function projectGrowth(
  initialInvestment: number,
  annualReturn: number,
  volatility: number,
  years: number
): { year: number; expected: number; optimistic: number; pessimistic: number }[] {
  const data = [];
  for (let y = 0; y <= years; y++) {
    const expected = initialInvestment * Math.pow(1 + annualReturn, y);
    const optimistic = initialInvestment * Math.pow(1 + annualReturn + volatility * 0.8, y);
    const pessimistic = initialInvestment * Math.pow(1 + Math.max(annualReturn - volatility * 0.8, -0.05), y);
    data.push({
      year: y,
      expected: Math.round(expected),
      optimistic: Math.round(optimistic),
      pessimistic: Math.round(pessimistic),
    });
  }
  return data;
}

/* ── Component ───────────────────────────────────────────── */
export function AdvisorConsole() {
  const [profile, setProfile] = useState<RiskProfile>(defaultProfile);
  const [investment] = useState(100000);

  const riskScore = useMemo(() => computeRiskScore(profile), [profile]);
  const band = getRiskBand(riskScore);
  const allocation = useMemo(() => computeAllocation(riskScore), [riskScore]);
  const stats = useMemo(() => portfolioStats(allocation), [allocation]);
  const projection = useMemo(
    () => projectGrowth(investment, stats.expReturn, stats.expVol, Math.min(profile.horizon, 30)),
    [investment, stats.expReturn, stats.expVol, profile.horizon]
  );

  const updateDim = (key: keyof RiskProfile, val: number) =>
    setProfile((p) => ({ ...p, [key]: val }));

  const bandColor =
    band === "Conservative" ? "#22C55E" :
    band === "Moderate" ? "#3B82F6" :
    band === "Growth" ? "#F59E0B" :
    "#EF4444";

  return (
    <div className="space-y-6">
      {/* Preset clients */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
          load client profile
        </div>
        <div className="flex gap-2 flex-wrap">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setProfile(p.profile)}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-surface-border bg-surface/80 text-foreground/60 hover:border-accent/30 hover:text-accent-light transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Risk dimension sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {([
          ["capacity", "Financial Capacity", 1, 10, ""],
          ["tolerance", "Risk Tolerance", 1, 10, ""],
          ["horizon", "Investment Horizon", 1, 30, "yr"],
          ["liquidity", "Liquidity Need", 1, 10, ""],
          ["knowledge", "Investment Knowledge", 1, 10, ""],
        ] as const).map(([key, label, min, max, unit]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between">
              <span className="font-mono text-xs text-foreground/50">{label}</span>
              <span className="font-mono text-xs text-accent-light">
                {profile[key]}{unit}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={key === "horizon" ? 1 : 1}
              value={profile[key]}
              onChange={(e) => updateDim(key, Number(e.target.value))}
              className="w-full accent-[#A855F7] h-1"
            />
          </div>
        ))}
      </div>

      {/* Risk Score + Band */}
      <div className="flex gap-4 flex-wrap">
        <StatTile label="Composite Risk Score" value={riskScore.toFixed(1)} accent />
        <div className="rounded-xl border border-surface-border bg-surface/80 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-1">
            Risk Band
          </div>
          <div className="font-mono text-lg font-semibold" style={{ color: bandColor }}>
            {band}
          </div>
        </div>
        <StatTile label="Expected Return" value={`${(stats.expReturn * 100).toFixed(1)}%`} />
        <StatTile label="Sharpe Ratio" value={stats.sharpe.toFixed(2)} accent />
      </div>

      {/* Allocation Pie + Legend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">
            Recommended Allocation
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={allocation}
                dataKey="weight"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                stroke="none"
              >
                {allocation.map((a) => (
                  <Cell key={a.name} fill={a.color} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => (
                  <ChartTooltip
                    active={active}
                    payload={payload as never}
                    formatter={(v) => `${v}%`}
                  />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col justify-center space-y-2">
          {allocation.map((a) => (
            <div key={a.name} className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: a.color }} />
              <span className="font-mono text-xs text-foreground/60 flex-1">{a.name}</span>
              <span className="font-mono text-xs text-foreground">{a.weight}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Growth Projection Chart */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">
          Portfolio Growth Projection — ₹{(investment / 1000).toFixed(0)}K initial
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={projection}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis
              dataKey="year"
              tick={{ fontSize: 10, fill: chartColors.axisText }}
              tickFormatter={(v) => `Y${v}`}
            />
            <YAxis
              tick={{ fontSize: 10, fill: chartColors.axisText }}
              tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as never}
                  label={`Year ${label}`}
                  formatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                />
              )}
            />
            <Area
              type="monotone"
              dataKey="optimistic"
              stroke="none"
              fill={chartColors.green}
              fillOpacity={0.1}
              name="Optimistic"
            />
            <Area
              type="monotone"
              dataKey="expected"
              stroke={chartColors.accentLight}
              fill={chartColors.accent}
              fillOpacity={0.2}
              strokeWidth={2}
              name="Expected"
            />
            <Area
              type="monotone"
              dataKey="pessimistic"
              stroke="none"
              fill={chartColors.red}
              fillOpacity={0.1}
              name="Pessimistic"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Suitability Verdict */}
      <div className="rounded-xl border border-surface-border bg-surface/80 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
          suitability.assessment()
        </div>
        <p className="font-mono text-sm text-foreground/70 leading-relaxed">
          Client profile maps to <span style={{ color: bandColor }} className="font-semibold">{band}</span> risk band
          (score {riskScore.toFixed(1)}/10). Recommended portfolio targets{" "}
          <span className="text-accent-light">{(stats.expReturn * 100).toFixed(1)}%</span> annual return
          with <span className="text-foreground">{(stats.expVol * 100).toFixed(1)}%</span> expected volatility.
          {band === "Conservative" && " Allocation emphasizes fixed-income instruments to preserve capital."}
          {band === "Moderate" && " Balanced allocation across fixed-income and equity for steady growth."}
          {band === "Growth" && " Equity-heavy allocation for long-horizon wealth accumulation."}
          {band === "Aggressive" && " High-conviction equity and alternatives allocation — suitable only with demonstrated risk capacity."}
          {" "}All recommended products fall within the client&apos;s assessed risk ceiling.
        </p>
      </div>
    </div>
  );
}

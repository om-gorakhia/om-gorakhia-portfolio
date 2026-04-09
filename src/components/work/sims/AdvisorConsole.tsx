"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { chartColors, ChartTooltip, StatTile } from "../ChartTheme";

/* ── Real FHI Engine Weights (from fhi_engine_data.json) ── */
const LR_ENHANCED = {
  net_worth_score: 0.115357,
  dti_score: 0.010889,
  savings_score: 0.126242,
  investment_score: 0.58911,
  emergency_score: 0.01508,
  spending_ratio_score: 0.060669,
  spending_volatility_score: 0.050576,
  panic_sell_score: 0.032078,
};

const CLUSTER_PROFILES = [
  { label: "Financially Vulnerable", color: "#EF4444", desc: "High debt, low savings and minimal emergency buffer. Immediate action needed.", avgFhi: 7.07 },
  { label: "Developing", color: "#F59E0B", desc: "Building financial foundations. Some savings but limited investment coverage.", avgFhi: 10.25 },
  { label: "Stable", color: "#3B82F6", desc: "Solid savings rate and manageable debt. Ready to grow investments.", avgFhi: 10.28 },
  { label: "Thriving", color: "#22C55E", desc: "Strong across all pillars — diversified investments, low debt.", avgFhi: 11.44 },
];

// Scaled centroids from the real K-Means model
const CENTROIDS_SCALED = [
  [-0.4472, -0.0756, -0.6095, -0.2316, -0.4505, -0.6095, 0.0704, -0.3819],
  [-0.3326, 0.0524, 1.2334, -0.2050, -0.1908, 1.2334, 0.0438, -0.3251],
  [1.4419, 0.1437, -0.1255, 0.0200, 1.3141, -0.1255, -0.3142, -0.3708],
  [-0.1832, -0.0779, -0.0764, 1.1921, -0.2378, -0.0764, 0.1922, 2.6185],
];

const SCALER_MEAN = [12.00, 97.05, 12.62, 0.81, 23.44, 12.62, 50.12, 6.36];
const SCALER_STD = [13.71, 4.36, 7.15, 1.35, 19.23, 7.15, 24.72, 16.66];

/* ── User Input Interface ─────────────────────────────────── */
interface UserInputs {
  income: number;       // monthly SGD
  expenses: number;     // monthly SGD
  debt: number;         // total outstanding
  savings: number;      // total savings
  investments: number;  // total invested
  emergencyFund: number; // months of expenses covered
  age: number;
}

const defaultInputs: UserInputs = {
  income: 4000,
  expenses: 2800,
  debt: 5000,
  savings: 8000,
  investments: 2000,
  emergencyFund: 2,
  age: 24,
};

const presets: { label: string; inputs: UserInputs }[] = [
  { label: "Uni Student", inputs: { income: 1200, expenses: 1000, debt: 12000, savings: 800, investments: 0, emergencyFund: 0.5, age: 21 } },
  { label: "Fresh Grad", inputs: { income: 4500, expenses: 3200, debt: 8000, savings: 3000, investments: 500, emergencyFund: 1, age: 23 } },
  { label: "Saver", inputs: { income: 5500, expenses: 2500, debt: 2000, savings: 25000, investments: 5000, emergencyFund: 6, age: 26 } },
  { label: "Investor", inputs: { income: 6000, expenses: 3500, debt: 1000, savings: 15000, investments: 40000, emergencyFund: 4, age: 28 } },
];

/* ── FHI Computation ──────────────────────────────────────── */
function computeFeatureScores(u: UserInputs) {
  const netWorth = u.savings + u.investments - u.debt;
  const netWorthScore = Math.max(0, Math.min(50, (netWorth / Math.max(u.income * 12, 1)) * 100));
  const dtiScore = Math.max(0, Math.min(100, 100 - (u.debt / Math.max(u.income * 12, 1)) * 100));
  const savingsRate = ((u.income - u.expenses) / Math.max(u.income, 1)) * 100;
  const savingsScore = Math.max(0, Math.min(40, savingsRate));
  const investmentScore = Math.max(0, Math.min(5, (u.investments / Math.max(netWorth > 0 ? netWorth : u.income * 12, 1)) * 5));
  const emergencyScore = Math.max(0, Math.min(60, u.emergencyFund * 10));
  const spendingRatio = (u.expenses / Math.max(u.income, 1)) * 100;
  const spendingRatioScore = Math.max(0, Math.min(40, 40 - (spendingRatio - 50)));
  const spendingVolScore = 50; // fixed in simulation (no time-series)
  const panicSellScore = investmentScore > 1 ? 10 : 0;

  return {
    net_worth_score: netWorthScore,
    dti_score: dtiScore,
    savings_score: savingsScore,
    investment_score: investmentScore,
    emergency_score: emergencyScore,
    spending_ratio_score: spendingRatioScore,
    spending_volatility_score: spendingVolScore,
    panic_sell_score: panicSellScore,
  };
}

function computeFHI(scores: Record<string, number>): number {
  let fhi = 0;
  for (const [key, weight] of Object.entries(LR_ENHANCED)) {
    fhi += (scores[key] ?? 0) * weight;
  }
  return Math.max(0, Math.min(50, fhi));
}

function assignCluster(scores: Record<string, number>): number {
  const keys = Object.keys(LR_ENHANCED);
  const scaled = keys.map((k, i) => ((scores[k] ?? 0) - SCALER_MEAN[i]) / SCALER_STD[i]);

  let bestCluster = 0;
  let bestDist = Infinity;
  for (let c = 0; c < CENTROIDS_SCALED.length; c++) {
    let dist = 0;
    for (let i = 0; i < scaled.length; i++) {
      dist += Math.pow(scaled[i] - CENTROIDS_SCALED[c][i], 2);
    }
    if (dist < bestDist) {
      bestDist = dist;
      bestCluster = c;
    }
  }
  return bestCluster;
}

function getFhiLabel(score: number): { label: string; color: string } {
  if (score >= 25) return { label: "Financially Strong", color: "#22C55E" };
  if (score >= 12) return { label: "On the Right Track", color: "#F59E0B" };
  return { label: "Building Foundations", color: "#EF4444" };
}

/* ── Component ───────────────────────────────────────────── */
export function AdvisorConsole() {
  const [inputs, setInputs] = useState<UserInputs>(defaultInputs);

  const scores = useMemo(() => computeFeatureScores(inputs), [inputs]);
  const fhi = useMemo(() => computeFHI(scores), [scores]);
  const cluster = useMemo(() => assignCluster(scores), [scores]);
  const fhiStatus = getFhiLabel(fhi);
  const personality = CLUSTER_PROFILES[cluster];

  const update = (key: keyof UserInputs, val: number) =>
    setInputs((p) => ({ ...p, [key]: val }));

  // Radar chart data
  const radarData = [
    { metric: "Net Worth", value: Math.min(scores.net_worth_score, 50), max: 50 },
    { metric: "Debt-to-Income", value: Math.min(scores.dti_score, 100), max: 100 },
    { metric: "Savings Rate", value: Math.min(scores.savings_score, 40), max: 40 },
    { metric: "Investment", value: Math.min(scores.investment_score * 20, 100), max: 100 },
    { metric: "Emergency Fund", value: Math.min(scores.emergency_score, 60), max: 60 },
    { metric: "Spending Control", value: Math.min(scores.spending_ratio_score, 40), max: 40 },
  ].map((d) => ({ ...d, pct: Math.round((d.value / d.max) * 100) }));

  // Weight breakdown bar chart
  const weightData = Object.entries(LR_ENHANCED)
    .map(([key, weight]) => ({
      name: key.replace(/_score$/, "").replace(/_/g, " "),
      weight: Math.round(weight * 100),
      contribution: Math.round(((scores as Record<string, number>)[key] ?? 0) * weight * 10) / 10,
    }))
    .sort((a, b) => b.weight - a.weight);

  return (
    <div className="space-y-6">
      {/* Preset profiles */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
          load user profile
        </div>
        <div className="flex gap-2 flex-wrap">
          {presets.map((p) => (
            <button
              key={p.label}
              onClick={() => setInputs(p.inputs)}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-surface-border bg-surface/80 text-foreground/60 hover:border-accent/30 hover:text-accent-light transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input sliders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {([
          ["income", "Monthly Income (SGD)", 500, 15000, ""],
          ["expenses", "Monthly Expenses (SGD)", 200, 12000, ""],
          ["debt", "Total Debt (SGD)", 0, 100000, ""],
          ["savings", "Total Savings (SGD)", 0, 100000, ""],
          ["investments", "Total Invested (SGD)", 0, 100000, ""],
          ["emergencyFund", "Emergency Fund (months)", 0, 12, "mo"],
          ["age", "Age", 18, 30, ""],
        ] as const).map(([key, label, min, max, unit]) => (
          <div key={key} className="space-y-1">
            <div className="flex justify-between">
              <span className="font-mono text-xs text-foreground/50">{label}</span>
              <span className="font-mono text-xs text-accent-light">
                {key === "emergencyFund" ? inputs[key].toFixed(1) : inputs[key].toLocaleString()}{unit}
              </span>
            </div>
            <input
              type="range"
              min={min}
              max={max}
              step={key === "emergencyFund" ? 0.5 : key === "age" ? 1 : 100}
              value={inputs[key]}
              onChange={(e) => update(key, Number(e.target.value))}
              className="w-full accent-[#A855F7] h-1"
            />
          </div>
        ))}
      </div>

      {/* FHI Score + Personality */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-surface-border bg-surface/80 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-1">
            FHI Score
          </div>
          <div className="font-mono text-2xl font-bold" style={{ color: fhiStatus.color }}>
            {fhi.toFixed(1)}
          </div>
          <div className="font-mono text-[10px]" style={{ color: fhiStatus.color }}>
            {fhiStatus.label}
          </div>
        </div>
        <div className="rounded-xl border border-surface-border bg-surface/80 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-1">
            Money Personality
          </div>
          <div className="font-mono text-sm font-semibold" style={{ color: personality.color }}>
            {personality.label}
          </div>
          <div className="font-mono text-[10px] text-foreground/40 mt-0.5">
            avg FHI: {personality.avgFhi}
          </div>
        </div>
        <StatTile
          label="Savings Rate"
          value={`${Math.round(((inputs.income - inputs.expenses) / Math.max(inputs.income, 1)) * 100)}%`}
        />
        <StatTile
          label="Investment Ratio"
          value={`${Math.round((inputs.investments / Math.max(inputs.savings + inputs.investments, 1)) * 100)}%`}
          accent
        />
      </div>

      {/* Radar Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">
            Financial Health Radar
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
              <PolarGrid stroke={chartColors.grid} />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 9, fill: chartColors.axisText }}
              />
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tick={{ fontSize: 8, fill: chartColors.axisText }}
              />
              <Radar
                dataKey="pct"
                stroke={chartColors.accentLight}
                fill={chartColors.accent}
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Weight Breakdown */}
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">
            FHI Weight Breakdown (L1 Coefficients)
          </div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={weightData} layout="vertical" barCategoryGap="15%">
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
              <XAxis
                type="number"
                domain={[0, 60]}
                tick={{ fontSize: 10, fill: chartColors.axisText }}
                tickFormatter={(v) => `${v}%`}
              />
              <YAxis
                type="category"
                dataKey="name"
                tick={{ fontSize: 9, fill: chartColors.axisText }}
                width={100}
              />
              <Tooltip
                content={({ active, payload, label }) => (
                  <ChartTooltip
                    active={active}
                    payload={payload as never}
                    label={String(label ?? "")}
                    formatter={(v, n) => n === "weight" ? `${v}%` : v.toFixed(1)}
                  />
                )}
              />
              <Bar dataKey="weight" name="Weight %" radius={[0, 4, 4, 0]}>
                {weightData.map((d, i) => (
                  <Cell key={i} fill={i === 0 ? chartColors.accentLight : chartColors.accent} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Personality description */}
      <div className="rounded-xl border border-surface-border bg-surface/80 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
          fhi.assess()
        </div>
        <p className="font-mono text-sm text-foreground/70 leading-relaxed">
          FHI Score <span style={{ color: fhiStatus.color }} className="font-semibold">{fhi.toFixed(1)}</span> — {fhiStatus.label}.
          {" "}Cluster assignment: <span style={{ color: personality.color }} className="font-semibold">{personality.label}</span>.
          {" "}{personality.desc}
          {" "}Investment behavior accounts for <span className="text-accent-light">59%</span> of the total FHI weight —
          the strongest predictor of long-term financial resilience for ages 18-30.
          {scores.investment_score < 1 && " Consider starting with a small, regular investment to significantly boost your FHI."}
          {scores.emergency_score < 20 && " Building an emergency fund covering 3+ months of expenses would strengthen your financial safety net."}
          {scores.savings_score > 20 && scores.investment_score < 1 && " Your savings rate is solid — redirecting some into investments would substantially improve your score."}
        </p>
      </div>
    </div>
  );
}

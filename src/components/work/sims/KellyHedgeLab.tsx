"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
  ScatterChart,
  Scatter,
  ZAxis,
} from "recharts";
import { StatTile, chartColors } from "../ChartTheme";

// --- Kelly Criterion Calculator ---
function kellyFraction(winProb: number, decimalOdds: number): number {
  const b = decimalOdds - 1;
  const q = 1 - winProb;
  const kelly = (winProb * b - q) / b;
  return Math.max(0, Math.min(kelly, 1));
}

function kellyCurve(winProb: number, decimalOdds: number) {
  const points = [];
  for (let f = 0; f <= 1; f += 0.02) {
    const b = decimalOdds - 1;
    const q = 1 - winProb;
    const growth = winProb * Math.log(1 + f * b) + q * Math.log(1 - f);
    points.push({
      fraction: Math.round(f * 100),
      growth: Math.round(growth * 10000) / 10000,
    });
  }
  return points;
}

// --- Hedge payoff calculation ---
interface HedgeResult {
  outcomes: { scenario: string; profit: number }[];
  lockedProfit: { min: number; max: number } | null;
}

function computeHedge(
  preBetStake: number,
  preOdds: number,
  hedgeStake: number,
  hedgeOdds: number
): HedgeResult {
  // Pre-match: bet on Team A at preOdds
  // Hedge: bet on Team B at hedgeOdds (in-play)
  const profitIfA = preBetStake * (preOdds - 1) - hedgeStake;
  const profitIfB = hedgeStake * (hedgeOdds - 1) - preBetStake;

  return {
    outcomes: [
      { scenario: "Team A wins", profit: Math.round(profitIfA) },
      { scenario: "Team B wins", profit: Math.round(profitIfB) },
    ],
    lockedProfit:
      profitIfA > 0 && profitIfB > 0
        ? { min: Math.min(profitIfA, profitIfB), max: Math.max(profitIfA, profitIfB) }
        : null,
  };
}

// --- Efficient frontier data ---
const frontierBets = [
  { name: "MI vs CSK", expectedReturn: 12, risk: 18, size: 200 },
  { name: "RCB vs KKR", expectedReturn: 8, risk: 12, size: 150 },
  { name: "DC vs SRH", expectedReturn: 15, risk: 25, size: 180 },
  { name: "GT vs LSG", expectedReturn: 6, risk: 8, size: 100 },
  { name: "PBKS vs RR", expectedReturn: 20, risk: 32, size: 250 },
];

const frontierCurve = Array.from({ length: 20 }, (_, i) => {
  const risk = 5 + i * 2;
  const ret = 3 + Math.sqrt(risk) * 4.5 - risk * 0.05;
  return { risk, return: Math.round(ret * 10) / 10 };
});

export function KellyHedgeLab() {
  // Kelly state
  const [winProb, setWinProb] = useState(55);
  const [odds, setOdds] = useState(2.1);
  const [bankroll, setBankroll] = useState(10000);

  // Hedge state
  const [preBetStake] = useState(1000);
  const [preOdds] = useState(2.5);
  const [hedgeOdds] = useState(1.8);
  const [hedgeFraction, setHedgeFraction] = useState(0);

  const kellyF = useMemo(() => kellyFraction(winProb / 100, odds), [winProb, odds]);
  const curve = useMemo(() => kellyCurve(winProb / 100, odds), [winProb, odds]);
  const optimalBet = Math.round(kellyF * bankroll);

  const hedgeStake = Math.round(hedgeFraction * preBetStake * 2);
  const hedgeResult = useMemo(
    () => computeHedge(preBetStake, preOdds, hedgeStake, hedgeOdds),
    [preBetStake, preOdds, hedgeStake, hedgeOdds]
  );

  // Payoff data for chart
  const payoffData = useMemo(() => {
    const points = [];
    for (let h = 0; h <= preBetStake * 2; h += 50) {
      const res = computeHedge(preBetStake, preOdds, h, hedgeOdds);
      points.push({
        hedge: h,
        teamA: res.outcomes[0].profit,
        teamB: res.outcomes[1].profit,
      });
    }
    return points;
  }, [preBetStake, preOdds, hedgeOdds]);

  return (
    <div className="space-y-8">
      {/* Kelly Calculator */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-4">
          kelly criterion calculator
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="font-mono text-xs text-foreground/40 block mb-1">
              Win Probability: {winProb}%
            </label>
            <input
              type="range"
              min={1}
              max={99}
              value={winProb}
              onChange={(e) => setWinProb(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-foreground/40 block mb-1">
              Decimal Odds: {odds.toFixed(2)}
            </label>
            <input
              type="range"
              min={101}
              max={1000}
              value={Math.round(odds * 100)}
              onChange={(e) => setOdds(Number(e.target.value) / 100)}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="font-mono text-xs text-foreground/40 block mb-1">
              Bankroll: ₹{bankroll.toLocaleString()}
            </label>
            <input
              type="range"
              min={1000}
              max={100000}
              step={1000}
              value={bankroll}
              onChange={(e) => setBankroll(Number(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
          <StatTile label="Kelly Fraction" value={`${(kellyF * 100).toFixed(1)}%`} accent />
          <StatTile label="Optimal Bet" value={`₹${optimalBet.toLocaleString()}`} />
          <StatTile
            label="Edge"
            value={kellyF > 0 ? "Positive" : "No edge"}
            accent={kellyF > 0}
          />
        </div>

        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={curve} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="fraction"
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                label={{ value: "Bet Size (%)", position: "insideBottom", offset: -2, fill: chartColors.axisText, fontSize: 10 }}
                interval={4}
              />
              <YAxis
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                width={50}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload as { fraction: number; growth: number };
                  return (
                    <div className="rounded-lg border px-3 py-2 font-mono text-xs" style={{ background: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder }}>
                      <div>Fraction: {d.fraction}%</div>
                      <div>Growth: {(d.growth * 100).toFixed(2)}%</div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                x={Math.round(kellyF * 100)}
                stroke={chartColors.accent}
                strokeWidth={2}
                label={{ value: "Optimal", fill: chartColors.accentLight, fontSize: 10 }}
              />
              <Bar
                dataKey="growth"
                fill={chartColors.accent}
                fillOpacity={0.5}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Hedge Visualizer */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-4">
          hedge visualizer — mumbai indians vs chennai super kings
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-xl border border-surface-border bg-surface/80 p-4">
            <div className="font-mono text-xs text-foreground/50 mb-2">Pre-match bet</div>
            <div className="font-mono text-sm text-accent-light">
              MI to win @ {preOdds} — ₹{preBetStake.toLocaleString()}
            </div>
          </div>
          <div>
            <label className="font-mono text-xs text-foreground/40 block mb-1">
              In-play hedge (CSK @ {hedgeOdds}): ₹{hedgeStake.toLocaleString()}
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(hedgeFraction * 100)}
              onChange={(e) => setHedgeFraction(Number(e.target.value) / 100)}
              className="w-full accent-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          {hedgeResult.outcomes.map((o) => (
            <div
              key={o.scenario}
              className="rounded-xl border border-surface-border bg-surface/80 px-4 py-3"
            >
              <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-1">
                {o.scenario}
              </div>
              <div
                className={`font-mono text-lg font-semibold ${
                  o.profit >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {o.profit >= 0 ? "+" : ""}₹{o.profit.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {hedgeResult.lockedProfit && (
          <motion.div
            className="rounded-xl border border-accent/30 bg-accent/5 px-4 py-3 mb-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="font-mono text-xs text-accent-light">
              Locked profit band: ₹{Math.round(hedgeResult.lockedProfit.min).toLocaleString()} — ₹
              {Math.round(hedgeResult.lockedProfit.max).toLocaleString()}
            </div>
          </motion.div>
        )}

        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={payoffData} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="hedge"
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                label={{ value: "Hedge Stake (₹)", position: "insideBottom", offset: -2, fill: chartColors.axisText, fontSize: 10 }}
              />
              <YAxis
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                width={55}
                tickFormatter={(v) => `₹${v}`}
              />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
              <ReferenceLine
                x={hedgeStake}
                stroke={chartColors.accent}
                strokeDasharray="5 5"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload as { hedge: number; teamA: number; teamB: number };
                  return (
                    <div className="rounded-lg border px-3 py-2 font-mono text-xs" style={{ background: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder }}>
                      <div className="text-foreground/40 mb-1">Hedge: ₹{d.hedge}</div>
                      <div className="text-green-400">MI wins: {d.teamA >= 0 ? "+" : ""}₹{d.teamA}</div>
                      <div className="text-amber-400">CSK wins: {d.teamB >= 0 ? "+" : ""}₹{d.teamB}</div>
                    </div>
                  );
                }}
              />
              <Line type="monotone" dataKey="teamA" stroke={chartColors.green} strokeWidth={2} dot={false} name="MI wins" />
              <Line type="monotone" dataKey="teamB" stroke={chartColors.amber} strokeWidth={2} dot={false} name="CSK wins" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Portfolio Frontier */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
          portfolio efficient frontier
        </div>
        <div className="h-48 md:h-56">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                type="number"
                dataKey="risk"
                name="Risk"
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                label={{ value: "Risk (%)", position: "insideBottom", offset: -2, fill: chartColors.axisText, fontSize: 10 }}
              />
              <YAxis
                type="number"
                dataKey="return"
                name="Return"
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                width={40}
                label={{ value: "Return (%)", angle: -90, position: "insideLeft", fill: chartColors.axisText, fontSize: 10 }}
              />
              <ZAxis range={[60, 60]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload as { risk: number; return: number };
                  return (
                    <div className="rounded-lg border px-3 py-2 font-mono text-xs" style={{ background: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder }}>
                      <div>Risk: {d.risk}%</div>
                      <div>Return: {d.return}%</div>
                    </div>
                  );
                }}
              />
              <Scatter data={frontierCurve} fill={chartColors.accent} fillOpacity={0.3} line={{ stroke: chartColors.accentLight, strokeWidth: 1.5 }} />
              <Scatter
                data={frontierBets.map((b) => ({ risk: b.risk, return: b.expectedReturn, name: b.name }))}
                fill={chartColors.accentLight}
              >
                {/* Individual bets */}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-2 flex-wrap mt-2">
          {frontierBets.map((b) => (
            <span key={b.name} className="font-mono text-[10px] px-2 py-1 rounded border border-surface-border text-foreground/40">
              {b.name} ({b.expectedReturn}% / {b.risk}%)
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

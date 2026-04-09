"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  LineChart,
} from "recharts";
import { StatTile, chartColors } from "../ChartTheme";

// --- Fake OHLC data generator ---
function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

interface OHLCBar {
  day: number;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

function generateOHLC(days: number): OHLCBar[] {
  const rand = seedRandom(42);
  const bars: OHLCBar[] = [];
  let price = 1500;
  const meanPrice = 1500;

  for (let i = 0; i < days; i++) {
    const volatility = 0.02 + rand() * 0.03;
    // Mean-reverting drift with occasional trends — creates oscillations strategies can detect
    const meanReversion = (meanPrice - price) / meanPrice * 0.05;
    const trend = Math.sin(i / 8) * 0.01;
    const drift = meanReversion + trend + (rand() - 0.5) * volatility;
    const open = price;
    const change1 = price * (drift + (rand() - 0.5) * volatility);
    const change2 = price * (drift + (rand() - 0.5) * volatility);
    const intraHigh = Math.max(change1, change2);
    const intraLow = Math.min(change1, change2);
    const close = open + price * drift;
    const high = Math.max(open, close) + Math.abs(intraHigh);
    const low = Math.min(open, close) - Math.abs(intraLow);
    const volume = Math.floor(500000 + rand() * 2500000);

    bars.push({
      day: i + 1,
      date: `D${i + 1}`,
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
    price = close;
  }
  return bars;
}

// --- Strategy functions ---
interface Signal {
  day: number;
  type: "buy" | "sell";
}

function sma(data: OHLCBar[], period: number): number[] {
  return data.map((_, i) => {
    if (i < period - 1) return NaN;
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) sum += data[j].close;
    return sum / period;
  });
}

function rsi(data: OHLCBar[], period: number = 14): number[] {
  const result: number[] = new Array(data.length).fill(NaN);
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? -change : 0);

    if (i >= period) {
      const avgGain = gains.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period, i).reduce((a, b) => a + b, 0) / period;
      result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
    }
  }
  return result;
}

function bollingerBands(data: OHLCBar[], period: number = 20, mult: number = 2) {
  const smaVals = sma(data, period);
  return data.map((_, i) => {
    if (isNaN(smaVals[i])) return { upper: NaN, lower: NaN, mid: NaN, width: NaN };
    let variance = 0;
    for (let j = i - period + 1; j <= i; j++) {
      variance += (data[j].close - smaVals[i]) ** 2;
    }
    const std = Math.sqrt(variance / period);
    return {
      upper: smaVals[i] + mult * std,
      lower: smaVals[i] - mult * std,
      mid: smaVals[i],
      width: (2 * mult * std) / smaVals[i],
    };
  });
}

const strategies: Record<string, { name: string; fn: (data: OHLCBar[]) => Signal[] }> = {
  momentum: {
    name: "Momentum Breakout",
    fn: (data) => {
      const signals: Signal[] = [];
      const sma10 = sma(data, 10);
      let inTrade = false;
      for (let i = 10; i < data.length; i++) {
        if (!inTrade && data[i].close > sma10[i] * 1.01 && data[i].volume > 1000000) {
          signals.push({ day: i, type: "buy" });
          inTrade = true;
        } else if (inTrade && (data[i].close < sma10[i] * 0.99 || i - signals[signals.length - 1].day > 8)) {
          signals.push({ day: i, type: "sell" });
          inTrade = false;
        }
      }
      return signals;
    },
  },
  meanReversion: {
    name: "Mean Reversion",
    fn: (data) => {
      const signals: Signal[] = [];
      const sma15 = sma(data, 15);
      let inTrade = false;
      for (let i = 15; i < data.length; i++) {
        if (!inTrade && data[i].close < sma15[i] * 0.985) {
          signals.push({ day: i, type: "buy" });
          inTrade = true;
        } else if (inTrade && data[i].close >= sma15[i] * 1.005) {
          signals.push({ day: i, type: "sell" });
          inTrade = false;
        }
      }
      return signals;
    },
  },
  rsiDivergence: {
    name: "RSI Divergence",
    fn: (data) => {
      const signals: Signal[] = [];
      const rsiVals = rsi(data);
      let inTrade = false;
      for (let i = 15; i < data.length; i++) {
        if (!inTrade && rsiVals[i] < 40) {
          signals.push({ day: i, type: "buy" });
          inTrade = true;
        } else if (inTrade && (rsiVals[i] > 60 || i - signals[signals.length - 1].day > 7)) {
          signals.push({ day: i, type: "sell" });
          inTrade = false;
        }
      }
      return signals;
    },
  },
  volumeSpike: {
    name: "Volume Spike",
    fn: (data) => {
      const signals: Signal[] = [];
      let inTrade = false;
      for (let i = 5; i < data.length; i++) {
        const avgVol = data.slice(Math.max(0, i - 5), i).reduce((a, b) => a + b.volume, 0) / Math.min(5, i);
        if (!inTrade && data[i].volume > avgVol * 1.5 && data[i].close > data[i].open) {
          signals.push({ day: i, type: "buy" });
          inTrade = true;
        } else if (inTrade && (data[i].close < data[i - 1].close * 0.99 || i - signals[signals.length - 1].day > 4)) {
          signals.push({ day: i, type: "sell" });
          inTrade = false;
        }
      }
      return signals;
    },
  },
  maCrossover: {
    name: "Moving Average Crossover",
    fn: (data) => {
      const signals: Signal[] = [];
      const fast = sma(data, 5);
      const slow = sma(data, 15);
      let inTrade = false;
      for (let i = 15; i < data.length; i++) {
        if (isNaN(fast[i]) || isNaN(slow[i])) continue;
        if (!inTrade && fast[i] > slow[i] && fast[i - 1] <= slow[i - 1]) {
          signals.push({ day: i, type: "buy" });
          inTrade = true;
        } else if (inTrade && fast[i] < slow[i] && fast[i - 1] >= slow[i - 1]) {
          signals.push({ day: i, type: "sell" });
          inTrade = false;
        }
      }
      return signals;
    },
  },
  bollingerSqueeze: {
    name: "Bollinger Squeeze",
    fn: (data) => {
      const signals: Signal[] = [];
      const bb = bollingerBands(data);
      let inTrade = false;
      for (let i = 22; i < data.length; i++) {
        if (isNaN(bb[i].width) || isNaN(bb[i - 3].width)) continue;
        const squeezed = bb[i].width < bb[i - 3].width * 0.85;
        if (!inTrade && squeezed && data[i].close > bb[i].mid) {
          signals.push({ day: i, type: "buy" });
          inTrade = true;
        } else if (inTrade && (data[i].close < bb[i].mid * 0.995 || i - signals[signals.length - 1].day > 6)) {
          signals.push({ day: i, type: "sell" });
          inTrade = false;
        }
      }
      return signals;
    },
  },
};

// --- Compute equity curve & stats ---
function computeBacktest(data: OHLCBar[], signals: Signal[]) {
  let equity = 100000;
  let shares = 0;
  let entryPrice = 0;
  let wins = 0;
  let losses = 0;
  let maxEquity = equity;
  let maxDrawdown = 0;

  const equityCurve = data.map((bar, i) => {
    const sig = signals.find((s) => s.day === i);
    if (sig?.type === "buy" && shares === 0) {
      shares = Math.floor(equity / bar.close);
      entryPrice = bar.close;
      equity -= shares * bar.close;
    } else if (sig?.type === "sell" && shares > 0) {
      equity += shares * bar.close;
      if (bar.close > entryPrice) wins++;
      else losses++;
      shares = 0;
    }
    const totalValue = equity + shares * bar.close;
    maxEquity = Math.max(maxEquity, totalValue);
    const drawdown = (maxEquity - totalValue) / maxEquity;
    maxDrawdown = Math.max(maxDrawdown, drawdown);
    return { day: bar.day, date: bar.date, equity: Math.round(totalValue) };
  });

  const totalTrades = wins + losses;
  const finalReturn = ((equityCurve[equityCurve.length - 1].equity - 100000) / 100000) * 100;

  return {
    equityCurve,
    totalTrades,
    winRate: totalTrades > 0 ? Math.round((wins / totalTrades) * 100) : 0,
    maxDrawdown: Math.round(maxDrawdown * 10000) / 100,
    finalReturn: Math.round(finalReturn * 100) / 100,
  };
}

// --- Screener dots ---
function ScreenerGrid({ passRate }: { passRate: number }) {
  const total = 2400;
  const passing = Math.floor(total * passRate);
  const cols = 60;
  const rows = Math.ceil(total / cols);

  return (
    <div className="mt-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
        screener: {passing} of {total} stocks pass filter
      </div>
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
      >
        {Array.from({ length: total }, (_, i) => (
          <motion.div
            key={i}
            className="aspect-square rounded-[1px]"
            initial={false}
            animate={{
              backgroundColor: i < passing ? chartColors.accent : "rgba(255,255,255,0.04)",
              boxShadow: i < passing ? `0 0 4px ${chartColors.accentGlow}` : "none",
            }}
            transition={{ duration: 0.4, delay: (i % cols) * 0.002 }}
          />
        ))}
      </div>
    </div>
  );
}

// --- Custom candlestick bar ---
function CandlestickBar(props: Record<string, unknown>) {
  const { x, y, width, height, payload } = props as {
    x: number;
    y: number;
    width: number;
    height: number;
    payload: OHLCBar;
  };
  if (!payload) return null;
  const { open, close, high, low } = payload;
  const isGreen = close >= open;
  const color = isGreen ? chartColors.green : chartColors.red;
  const bodyTop = Math.min(open, close);
  const bodyBottom = Math.max(open, close);
  // Use the chart's Y scale - approximate from the bar position
  const barCenter = x + width / 2;

  return (
    <g>
      {/* Wick */}
      <line
        x1={barCenter}
        y1={y}
        x2={barCenter}
        y2={y + height}
        stroke={color}
        strokeWidth={1}
        opacity={0.6}
      />
      {/* Body */}
      <rect
        x={x + width * 0.15}
        y={y + height * ((high - bodyBottom) / (high - low || 1))}
        width={width * 0.7}
        height={Math.max(height * (Math.abs(close - open) / (high - low || 1)), 1)}
        fill={isGreen ? color : color}
        fillOpacity={isGreen ? 0.8 : 0.8}
        stroke={color}
        strokeWidth={0.5}
      />
    </g>
  );
}

// --- Main component ---
export function StrategySandbox() {
  const [activeStrategy, setActiveStrategy] = useState("momentum");
  const ohlcData = useMemo(() => generateOHLC(60), []);

  const signals = useMemo(
    () => strategies[activeStrategy].fn(ohlcData),
    [activeStrategy, ohlcData]
  );

  const backtest = useMemo(
    () => computeBacktest(ohlcData, signals),
    [ohlcData, signals]
  );

  // Prepare chart data with signal markers
  const chartData = useMemo(() => {
    return ohlcData.map((bar, i) => {
      const sig = signals.find((s) => s.day === i);
      return {
        ...bar,
        range: [bar.low, bar.high],
        signalBuy: sig?.type === "buy" ? bar.low * 0.99 : undefined,
        signalSell: sig?.type === "sell" ? bar.high * 1.01 : undefined,
      };
    });
  }, [ohlcData, signals]);

  const passRates: Record<string, number> = {
    momentum: 0.03,
    meanReversion: 0.05,
    rsiDivergence: 0.02,
    volumeSpike: 0.015,
    maCrossover: 0.04,
    bollingerSqueeze: 0.025,
  };

  return (
    <div className="space-y-6">
      {/* Strategy selector */}
      <div className="flex gap-2 flex-wrap">
        {Object.entries(strategies).map(([key, strat]) => (
          <button
            key={key}
            onClick={() => setActiveStrategy(key)}
            className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
              activeStrategy === key
                ? "border-accent bg-accent/10 text-accent-light"
                : "border-surface-border text-foreground/40 hover:border-accent/30 hover:text-foreground/60"
            }`}
          >
            {strat.name}
          </button>
        ))}
      </div>

      {/* Price chart */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
          OHLC — 60 day simulated NSE data
        </div>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                interval={9}
              />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                width={55}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload as OHLCBar;
                  if (!d) return null;
                  return (
                    <div
                      className="rounded-lg border px-3 py-2 font-mono text-xs"
                      style={{ background: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder }}
                    >
                      <div className="text-foreground/40 mb-1">{label}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                        <span className="text-foreground/50">O:</span><span>{d.open?.toFixed(2)}</span>
                        <span className="text-foreground/50">H:</span><span>{d.high?.toFixed(2)}</span>
                        <span className="text-foreground/50">L:</span><span>{d.low?.toFixed(2)}</span>
                        <span className="text-foreground/50">C:</span><span>{d.close?.toFixed(2)}</span>
                        <span className="text-foreground/50">Vol:</span><span>{(d.volume / 1000).toFixed(0)}K</span>
                      </div>
                    </div>
                  );
                }}
              />
              {/* Volume bars */}
              <Bar
                dataKey="volume"
                yAxisId="volume"
                fill={chartColors.accent}
                fillOpacity={0.15}
                barSize={6}
              />
              {/* Price line */}
              <Line
                type="monotone"
                dataKey="close"
                stroke={chartColors.accentLight}
                strokeWidth={1.5}
                dot={false}
              />
              {/* Buy signals */}
              <Line
                type="monotone"
                dataKey="signalBuy"
                stroke={chartColors.green}
                strokeWidth={0}
                dot={{ r: 4, fill: chartColors.green, stroke: chartColors.green }}
                connectNulls={false}
                isAnimationActive={false}
              />
              {/* Sell signals */}
              <Line
                type="monotone"
                dataKey="signalSell"
                stroke={chartColors.red}
                strokeWidth={0}
                dot={{ r: 4, fill: chartColors.red, stroke: chartColors.red }}
                connectNulls={false}
                isAnimationActive={false}
              />
              <YAxis
                yAxisId="volume"
                orientation="right"
                domain={[0, (max: number) => max * 4]}
                hide
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Equity curve */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeStrategy}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
            equity curve — backtest P&L
          </div>
          <div className="h-40 md:h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={backtest.equityCurve} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: chartColors.grid }}
                  tickLine={false}
                  interval={9}
                />
                <YAxis
                  tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                  axisLine={{ stroke: chartColors.grid }}
                  tickLine={false}
                  width={65}
                  tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`}
                />
                <ReferenceLine
                  y={100000}
                  stroke={chartColors.accentGlow}
                  strokeDasharray="3 3"
                  label={{ value: "Start", fill: chartColors.axisText, fontSize: 10 }}
                />
                <Line
                  type="monotone"
                  dataKey="equity"
                  stroke={
                    backtest.finalReturn >= 0
                      ? chartColors.green
                      : chartColors.red
                  }
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Total Trades" value={String(backtest.totalTrades)} />
        <StatTile label="Win Rate" value={`${backtest.winRate}%`} accent />
        <StatTile label="Max Drawdown" value={`${backtest.maxDrawdown}%`} />
        <StatTile
          label="Return"
          value={`${backtest.finalReturn > 0 ? "+" : ""}${backtest.finalReturn}%`}
          accent
        />
      </div>

      {/* Screener */}
      <ScreenerGrid passRate={passRates[activeStrategy]} />
    </div>
  );
}

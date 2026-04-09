"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import { StatTile, chartColors } from "../ChartTheme";

// --- Demand model ---
interface Segment {
  name: string;
  baseQuantity: number;
  elasticityRange: [number, number]; // min, max elasticity (negative values)
  willingness: number; // max price tolerance
}

const segments: Record<string, Segment> = {
  business: {
    name: "Business Traveler",
    baseQuantity: 800,
    elasticityRange: [-0.3, -0.8],
    willingness: 250,
  },
  leisure: {
    name: "Leisure",
    baseQuantity: 2000,
    elasticityRange: [-1.2, -2.5],
    willingness: 120,
  },
  commuter: {
    name: "Commuter",
    baseQuantity: 3500,
    elasticityRange: [-0.5, -1.2],
    willingness: 180,
  },
  student: {
    name: "Student",
    baseQuantity: 1500,
    elasticityRange: [-1.8, -3.5],
    willingness: 60,
  },
};

function demandCurve(
  segment: Segment,
  elasticity: number,
  prices: number[]
): { price: number; quantity: number; revenue: number }[] {
  const basePrice = 50;
  return prices.map((price) => {
    const priceRatio = price / basePrice;
    const quantity = Math.max(
      0,
      Math.round(segment.baseQuantity * Math.pow(priceRatio, elasticity))
    );
    const revenue = price * quantity;
    return { price, quantity, revenue };
  });
}

function findOptimal(data: { price: number; quantity: number; revenue: number }[]) {
  return data.reduce((best, point) =>
    point.revenue > best.revenue ? point : best
  );
}

function elasticityRegime(e: number): string {
  const abs = Math.abs(e);
  if (abs < 1) return "Inelastic";
  if (abs === 1) return "Unit Elastic";
  return "Elastic";
}

// --- Heatmap ---
function Heatmap({
  data,
}: {
  data: { segment: string; prices: { price: number; revenue: number }[] }[];
}) {
  const allRevenues = data.flatMap((s) => s.prices.map((p) => p.revenue));
  const maxRev = Math.max(...allRevenues);
  const minRev = Math.min(...allRevenues.filter((r) => r > 0));

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="font-mono text-[10px] text-foreground/30 p-1 text-left">Segment</th>
            {data[0]?.prices.map((p) => (
              <th key={p.price} className="font-mono text-[10px] text-foreground/30 p-1">
                ${p.price}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((seg) => (
            <tr key={seg.segment}>
              <td className="font-mono text-[10px] text-foreground/40 p-1 whitespace-nowrap">
                {seg.segment}
              </td>
              {seg.prices.map((p) => {
                const intensity = maxRev > minRev
                  ? (p.revenue - minRev) / (maxRev - minRev)
                  : 0;
                const isMax = p.revenue === maxRev;
                return (
                  <td key={p.price} className="p-0.5">
                    <div
                      className={`w-full h-7 rounded-sm flex items-center justify-center font-mono text-[9px] ${isMax ? "ring-1 ring-accent-light" : ""}`}
                      style={{
                        backgroundColor: `rgba(168, 85, 247, ${intensity * 0.6 + 0.05})`,
                        color:
                          intensity > 0.5
                            ? "rgba(255,255,255,0.8)"
                            : "rgba(255,255,255,0.3)",
                      }}
                    >
                      {(p.revenue / 1000).toFixed(0)}K
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function PricingLab() {
  const [segmentKey, setSegmentKey] = useState("business");
  const [elasticitySlider, setElasticitySlider] = useState(50); // 0-100 maps to segment's range

  const segment = segments[segmentKey];
  const elasticity =
    segment.elasticityRange[0] +
    (elasticitySlider / 100) * (segment.elasticityRange[1] - segment.elasticityRange[0]);

  const prices = useMemo(() => {
    const pts = [];
    for (let p = 10; p <= 250; p += 5) pts.push(p);
    return pts;
  }, []);

  const curveData = useMemo(
    () => demandCurve(segment, elasticity, prices),
    [segment, elasticity, prices]
  );

  const optimal = useMemo(() => findOptimal(curveData), [curveData]);

  // Heatmap data across all segments
  const heatmapPrices = [20, 40, 60, 80, 100, 120, 150, 180, 220];
  const heatmapData = useMemo(
    () =>
      Object.entries(segments).map(([key, seg]) => ({
        segment: seg.name,
        prices: heatmapPrices.map((price) => {
          const midElasticity =
            (seg.elasticityRange[0] + seg.elasticityRange[1]) / 2;
          const priceRatio = price / 50;
          const quantity = Math.max(
            0,
            Math.round(seg.baseQuantity * Math.pow(priceRatio, midElasticity))
          );
          return { price, revenue: price * quantity };
        }),
      })),
    []
  );

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-foreground/40 block mb-1">
            Market Segment
          </label>
          <div className="flex gap-2 flex-wrap">
            {Object.entries(segments).map(([key, seg]) => (
              <button
                key={key}
                onClick={() => { setSegmentKey(key); setElasticitySlider(50); }}
                className={`font-mono text-xs px-3 py-1.5 rounded-lg border transition-all ${
                  segmentKey === key
                    ? "border-accent bg-accent/10 text-accent-light"
                    : "border-surface-border text-foreground/40 hover:border-accent/30"
                }`}
              >
                {seg.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="font-mono text-xs text-foreground/40 block mb-1">
            Price Elasticity: {elasticity.toFixed(2)} ({elasticityRegime(elasticity)})
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={elasticitySlider}
            onChange={(e) => setElasticitySlider(Number(e.target.value))}
            className="w-full accent-accent"
          />
          <div className="flex justify-between font-mono text-[10px] text-foreground/20">
            <span>Less elastic</span>
            <span>More elastic</span>
          </div>
        </div>
      </div>

      {/* Demand + Revenue curves */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
          demand & revenue curves — {segment.name}
        </div>
        <div className="h-64 md:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={curveData} margin={{ top: 10, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" />
              <XAxis
                dataKey="price"
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                label={{
                  value: "Price ($)",
                  position: "insideBottom",
                  offset: -2,
                  fill: chartColors.axisText,
                  fontSize: 10,
                }}
                interval={9}
              />
              <YAxis
                yAxisId="qty"
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                width={55}
                label={{
                  value: "Quantity",
                  angle: -90,
                  position: "insideLeft",
                  fill: chartColors.axisText,
                  fontSize: 10,
                }}
              />
              <YAxis
                yAxisId="rev"
                orientation="right"
                tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                axisLine={{ stroke: chartColors.grid }}
                tickLine={false}
                width={55}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0]?.payload as { price: number; quantity: number; revenue: number };
                  return (
                    <div
                      className="rounded-lg border px-3 py-2 font-mono text-xs"
                      style={{ background: chartColors.tooltipBg, borderColor: chartColors.tooltipBorder }}
                    >
                      <div>Price: ${d.price}</div>
                      <div>Quantity: {d.quantity.toLocaleString()}</div>
                      <div>Revenue: ${d.revenue.toLocaleString()}</div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                x={optimal.price}
                yAxisId="qty"
                stroke={chartColors.accent}
                strokeWidth={2}
                strokeDasharray="5 5"
                label={{
                  value: `Optimal: $${optimal.price}`,
                  fill: chartColors.accentLight,
                  fontSize: 10,
                  position: "top",
                }}
              />
              <Line
                yAxisId="qty"
                type="monotone"
                dataKey="quantity"
                stroke={chartColors.accentLight}
                strokeWidth={2}
                dot={false}
                name="Demand"
              />
              <Area
                yAxisId="rev"
                type="monotone"
                dataKey="revenue"
                fill={chartColors.accent}
                fillOpacity={0.1}
                stroke={chartColors.accent}
                strokeWidth={1.5}
                dot={false}
                name="Revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Optimal Price" value={`$${optimal.price}`} accent />
        <StatTile label="Projected Demand" value={optimal.quantity.toLocaleString()} />
        <StatTile label="Projected Revenue" value={`$${optimal.revenue.toLocaleString()}`} accent />
        <StatTile label="Elasticity Regime" value={elasticityRegime(elasticity)} />
      </div>

      {/* Heatmap */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
          revenue heatmap — all segments × price points
        </div>
        <Heatmap data={heatmapData} />
      </div>
    </div>
  );
}

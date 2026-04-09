"use client";

import { useState, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  Legend,
  Cell,
} from "recharts";
import { chartColors, ChartTooltip, StatTile } from "../ChartTheme";

/* ── Warehouse / Region Data ─────────────────────────────── */
interface Warehouse {
  id: string;
  name: string;
  capacity: number; // units per year
  holdingCost: number; // per unit
  lat: number;
  lng: number;
}

interface Region {
  id: string;
  name: string;
  demand: number; // units per year
}

const warehouses: Warehouse[] = [
  { id: "W1", name: "Mumbai", capacity: 120000, holdingCost: 2.5, lat: 19.08, lng: 72.88 },
  { id: "W2", name: "Delhi", capacity: 150000, holdingCost: 2.8, lat: 28.61, lng: 77.21 },
  { id: "W3", name: "Bangalore", capacity: 90000, holdingCost: 2.2, lat: 12.97, lng: 77.59 },
  { id: "W4", name: "Chennai", capacity: 80000, holdingCost: 2.0, lat: 13.08, lng: 80.27 },
  { id: "W5", name: "Kolkata", capacity: 70000, holdingCost: 1.8, lat: 22.57, lng: 88.36 },
  { id: "W6", name: "Hyderabad", capacity: 100000, holdingCost: 2.3, lat: 17.38, lng: 78.49 },
];

const regions: Region[] = [
  { id: "R1", name: "West", demand: 95000 },
  { id: "R2", name: "North", demand: 130000 },
  { id: "R3", name: "South-W", demand: 72000 },
  { id: "R4", name: "South-E", demand: 65000 },
  { id: "R5", name: "East", demand: 58000 },
  { id: "R6", name: "Central", demand: 45000 },
  { id: "R7", name: "NE", demand: 22000 },
  { id: "R8", name: "NW", demand: 38000 },
  { id: "R9", name: "Pen.Tip", demand: 30000 },
  { id: "R10", name: "Plateau", demand: 35000 },
];

// Transport cost matrix (simplified: cost per unit from warehouse to region)
const transportCost: number[][] = [
  [1.0, 3.5, 2.5, 3.0, 4.0, 2.0, 5.5, 4.0, 3.5, 2.5], // W1 Mumbai
  [3.5, 1.0, 4.5, 4.0, 3.0, 2.5, 3.5, 1.5, 5.0, 3.0], // W2 Delhi
  [2.5, 4.5, 1.0, 1.5, 4.5, 2.0, 6.0, 5.0, 2.0, 1.5], // W3 Bangalore
  [3.0, 4.0, 1.5, 1.0, 3.5, 2.5, 5.0, 5.5, 1.5, 2.0], // W4 Chennai
  [4.0, 3.0, 4.5, 3.5, 1.0, 3.5, 2.0, 4.0, 5.0, 4.0], // W5 Kolkata
  [2.0, 2.5, 2.0, 2.5, 3.5, 1.0, 5.0, 3.5, 3.0, 1.0], // W6 Hyderabad
];

const stockoutPenalty = 15; // cost per unfulfilled unit

/* ── Greedy LP-like Solver ───────────────────────────────── */
interface Solution {
  shipments: number[][]; // W × R
  fulfillment: number;
  totalCost: number;
  transportTotal: number;
  holdingTotal: number;
  stockoutTotal: number;
  warehouseUtil: number[];
  regionFulfill: number[];
}

function solve(
  capacityMult: number,
  transportMult: number,
  turnover: number
): Solution {
  const W = warehouses.length;
  const R = regions.length;
  const shipments: number[][] = Array.from({ length: W }, () => Array(R).fill(0));
  const remainingCapacity = warehouses.map((w) => w.capacity * capacityMult * (turnover / 12));
  const remainingDemand = regions.map((r) => r.demand);

  // Greedy: for each region, find cheapest available warehouse
  for (let pass = 0; pass < 3; pass++) {
    for (let r = 0; r < R; r++) {
      if (remainingDemand[r] <= 0) continue;

      // Sort warehouses by transport cost for this region
      const wOrder = Array.from({ length: W }, (_, i) => i)
        .sort((a, b) => transportCost[a][r] * transportMult - transportCost[b][r] * transportMult);

      for (const w of wOrder) {
        if (remainingCapacity[w] <= 0 || remainingDemand[r] <= 0) continue;
        const ship = Math.min(remainingCapacity[w], remainingDemand[r]);
        shipments[w][r] += ship;
        remainingCapacity[w] -= ship;
        remainingDemand[r] -= ship;
      }
    }
  }

  const totalDemand = regions.reduce((s, r) => s + r.demand, 0);
  const totalFulfilled = totalDemand - remainingDemand.reduce((s, d) => s + d, 0);
  const fulfillment = totalFulfilled / totalDemand;

  let transportTotal = 0;
  let holdingTotal = 0;
  for (let w = 0; w < W; w++) {
    const shipped = shipments[w].reduce((s, v) => s + v, 0);
    for (let r = 0; r < R; r++) {
      transportTotal += shipments[w][r] * transportCost[w][r] * transportMult;
    }
    holdingTotal += shipped * warehouses[w].holdingCost;
  }
  const stockoutTotal = remainingDemand.reduce((s, d) => s + d, 0) * stockoutPenalty;

  const warehouseUtil = warehouses.map((w, i) => {
    const cap = w.capacity * capacityMult * (turnover / 12);
    const used = cap - remainingCapacity[i];
    return cap > 0 ? used / cap : 0;
  });

  const regionFulfill = regions.map((r, i) => {
    return r.demand > 0 ? (r.demand - remainingDemand[i]) / r.demand : 1;
  });

  return {
    shipments,
    fulfillment,
    totalCost: transportTotal + holdingTotal + stockoutTotal,
    transportTotal,
    holdingTotal,
    stockoutTotal,
    warehouseUtil,
    regionFulfill,
  };
}

/* ── Component ───────────────────────────────────────────── */
export function WarehouseOptimizer() {
  const [capacityMult, setCapacityMult] = useState(1.0);
  const [transportMult, setTransportMult] = useState(1.0);
  const [turnover, setTurnover] = useState(12);

  const solution = useMemo(
    () => solve(capacityMult, transportMult, turnover),
    [capacityMult, transportMult, turnover]
  );

  const baseline = useMemo(() => solve(1.0, 1.0, 12), []);

  // Scenario sweep data for the line chart
  const scenarioData = useMemo(() => {
    return [0.8, 0.9, 1.0, 1.1, 1.2, 1.3].map((cm) => {
      const s = solve(cm, transportMult, turnover);
      return {
        capacity: `${Math.round(cm * 100)}%`,
        fulfillment: Math.round(s.fulfillment * 1000) / 10,
        cost: Math.round(s.totalCost / 1000),
      };
    });
  }, [transportMult, turnover]);

  // Warehouse utilization chart data
  const utilData = warehouses.map((w, i) => ({
    name: w.name,
    utilization: Math.round(solution.warehouseUtil[i] * 100),
    capacity: Math.round(w.capacity * capacityMult * (turnover / 12)),
  }));

  // Region fulfillment chart data
  const regionData = regions.map((r, i) => ({
    name: r.name,
    fulfillment: Math.round(solution.regionFulfill[i] * 100),
    demand: r.demand,
  }));

  const profitImprovement = baseline.totalCost - solution.totalCost;

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-mono text-xs text-foreground/50">Capacity Scale</span>
            <span className="font-mono text-xs text-accent-light">{Math.round(capacityMult * 100)}%</span>
          </div>
          <input
            type="range" min={0.5} max={1.5} step={0.05}
            value={capacityMult}
            onChange={(e) => setCapacityMult(Number(e.target.value))}
            className="w-full accent-[#A855F7] h-1"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-mono text-xs text-foreground/50">Transport Cost</span>
            <span className="font-mono text-xs text-accent-light">{Math.round(transportMult * 100)}%</span>
          </div>
          <input
            type="range" min={0.7} max={1.3} step={0.05}
            value={transportMult}
            onChange={(e) => setTransportMult(Number(e.target.value))}
            className="w-full accent-[#A855F7] h-1"
          />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between">
            <span className="font-mono text-xs text-foreground/50">Inventory Turnover</span>
            <span className="font-mono text-xs text-accent-light">{turnover}×/yr</span>
          </div>
          <input
            type="range" min={4} max={24} step={1}
            value={turnover}
            onChange={(e) => setTurnover(Number(e.target.value))}
            className="w-full accent-[#A855F7] h-1"
          />
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatTile label="Fulfillment Rate" value={`${(solution.fulfillment * 100).toFixed(1)}%`} accent />
        <StatTile label="Total System Cost" value={`$${(solution.totalCost / 1000).toFixed(0)}K`} />
        <StatTile label="Stockout Cost" value={`$${(solution.stockoutTotal / 1000).toFixed(0)}K`} />
        <div className="rounded-xl border border-surface-border bg-surface/80 px-4 py-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-1">
            vs Baseline
          </div>
          <div className={`font-mono text-lg font-semibold ${profitImprovement >= 0 ? "text-green-400" : "text-red-400"}`}>
            {profitImprovement >= 0 ? "-" : "+"}${Math.abs(Math.round(profitImprovement / 1000))}K
          </div>
        </div>
      </div>

      {/* Warehouse Utilization */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">
          Warehouse Utilization
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={utilData} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: chartColors.axisText }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: chartColors.axisText }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as never}
                  label={String(label ?? "")}
                  formatter={(v, n) => n === "utilization" ? `${v}%` : v.toLocaleString()}
                />
              )}
            />
            <Bar dataKey="utilization" fill={chartColors.accent} radius={[4, 4, 0, 0]} name="Utilization %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Region Fulfillment */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">
          Region Fulfillment
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={regionData} barCategoryGap="15%">
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="name" tick={{ fontSize: 9, fill: chartColors.axisText }} />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 10, fill: chartColors.axisText }}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as never}
                  label={String(label ?? "")}
                  formatter={(v) => `${v}%`}
                />
              )}
            />
            <Bar dataKey="fulfillment" name="Fulfillment %">
              {regionData.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.fulfillment >= 95 ? chartColors.green : d.fulfillment >= 80 ? chartColors.amber : chartColors.red}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scenario Sweep */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-3">
          Capacity Scenario Analysis
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={scenarioData}>
            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
            <XAxis dataKey="capacity" tick={{ fontSize: 10, fill: chartColors.axisText }} />
            <YAxis
              yAxisId="left"
              domain={[50, 100]}
              tick={{ fontSize: 10, fill: chartColors.axisText }}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 10, fill: chartColors.axisText }}
              tickFormatter={(v) => `$${v}K`}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <ChartTooltip
                  active={active}
                  payload={payload as never}
                  label={`Capacity: ${label}`}
                  formatter={(v, n) => n === "fulfillment" ? `${v}%` : `$${v}K`}
                />
              )}
            />
            <Legend
              wrapperStyle={{ fontSize: 10, fontFamily: "monospace" }}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="fulfillment"
              stroke={chartColors.green}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.green }}
              name="Fulfillment %"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cost"
              stroke={chartColors.red}
              strokeWidth={2}
              dot={{ r: 3, fill: chartColors.red }}
              name="Total Cost"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Verdict */}
      <div className="rounded-xl border border-surface-border bg-surface/80 p-4">
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/40 mb-2">
          optimization.verdict()
        </div>
        <p className="font-mono text-sm text-foreground/70 leading-relaxed">
          At {Math.round(capacityMult * 100)}% capacity with {turnover}× annual turnover,
          the network achieves <span className="text-accent-light font-semibold">{(solution.fulfillment * 100).toFixed(1)}%</span> fulfillment
          at <span className="text-foreground">${(solution.totalCost / 1000).toFixed(0)}K</span> total cost.
          {solution.fulfillment >= 0.99 && " All regions are served at near-perfect fulfillment."}
          {solution.fulfillment < 0.99 && solution.fulfillment >= 0.9 && " Some regional gaps remain — consider capacity expansion in constrained nodes."}
          {solution.fulfillment < 0.9 && " Significant stockouts detected — network capacity is the binding constraint."}
          {" "}Transport costs account for ${(solution.transportTotal / 1000).toFixed(0)}K
          ({Math.round((solution.transportTotal / solution.totalCost) * 100)}% of total).
        </p>
      </div>
    </div>
  );
}


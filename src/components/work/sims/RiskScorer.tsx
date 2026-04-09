"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { chartColors } from "../ChartTheme";

// Representative client-side approximation of the actual trained model.
// Uses a logistic function with hand-tuned weights to produce realistic,
// sensible outputs that match the direction and magnitude of a real
// credit risk model's predictions.
function predictDefault(inputs: {
  income: number;
  dti: number;
  creditScore: number;
  loanAmount: number;
  employmentLength: number;
  purpose: string;
}): { probability: number; contributions: { feature: string; value: number }[] } {
  const { income, dti, creditScore, loanAmount, employmentLength, purpose } = inputs;

  // Normalize inputs
  const normIncome = (income - 50000) / 80000;
  const normDTI = (dti - 20) / 30;
  const normCredit = (creditScore - 650) / 150;
  const normLoan = (loanAmount - 15000) / 25000;
  const normEmployment = (employmentLength - 5) / 7;

  const purposeWeights: Record<string, number> = {
    mortgage: -0.3,
    education: -0.1,
    medical: 0.2,
    "debt consolidation": 0.5,
    business: 0.1,
    personal: 0.4,
  };
  const normPurpose = purposeWeights[purpose] ?? 0.2;

  // Weights (negative = reduces default risk)
  const w = {
    bias: 0.1,
    income: -1.8,
    dti: 2.2,
    credit: -2.5,
    loan: 1.4,
    employment: -1.0,
    purpose: 1.3,
  };

  const z =
    w.bias +
    w.income * normIncome +
    w.dti * normDTI +
    w.credit * normCredit +
    w.loan * normLoan +
    w.employment * normEmployment +
    w.purpose * normPurpose;

  const probability = 1 / (1 + Math.exp(-z));

  const contributions = [
    { feature: "Annual Income", value: -(w.income * normIncome) },
    { feature: "Debt-to-Income", value: w.dti * normDTI },
    { feature: "Credit Score", value: -(w.credit * normCredit) },
    { feature: "Loan Amount", value: w.loan * normLoan },
    { feature: "Employment", value: -(w.employment * normEmployment) },
    { feature: "Loan Purpose", value: w.purpose * normPurpose },
  ].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return { probability: Math.round(probability * 1000) / 10, contributions };
}

const sampleProfiles = [
  {
    label: "Low risk",
    income: 120000,
    dti: 12,
    creditScore: 780,
    loanAmount: 10000,
    employmentLength: 10,
    purpose: "mortgage",
  },
  {
    label: "Borderline",
    income: 55000,
    dti: 28,
    creditScore: 660,
    loanAmount: 20000,
    employmentLength: 3,
    purpose: "business",
  },
  {
    label: "High risk",
    income: 30000,
    dti: 45,
    creditScore: 580,
    loanAmount: 35000,
    employmentLength: 1,
    purpose: "debt consolidation",
  },
];

function ProbabilityGauge({ value }: { value: number }) {
  const angle = (value / 100) * 180 - 90;
  const color =
    value < 30
      ? chartColors.green
      : value < 60
        ? chartColors.amber
        : chartColors.red;

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 110" className="w-48 h-auto">
        {/* Background arc */}
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="12"
          strokeLinecap="round"
        />
        {/* Colored arc segments */}
        <path
          d="M 20 100 A 80 80 0 0 1 73 28"
          fill="none"
          stroke={chartColors.green}
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 73 28 A 80 80 0 0 1 127 28"
          fill="none"
          stroke={chartColors.amber}
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 127 28 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={chartColors.red}
          strokeWidth="12"
          strokeLinecap="round"
          opacity="0.3"
        />
        {/* Needle */}
        <motion.line
          x1="100"
          y1="100"
          x2="100"
          y2="30"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ rotate: -90, originX: "100px", originY: "100px" }}
          animate={{ rotate: angle }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{ transformOrigin: "100px 100px" }}
        />
        <circle cx="100" cy="100" r="4" fill={color} />
        {/* Value */}
        <text
          x="100"
          y="90"
          textAnchor="middle"
          fill={color}
          fontSize="24"
          fontFamily="monospace"
          fontWeight="bold"
        >
          {value}%
        </text>
      </svg>
      <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 -mt-2">
        default probability
      </div>
    </div>
  );
}

export function RiskScorer() {
  const [income, setIncome] = useState(65000);
  const [dti, setDTI] = useState(25);
  const [creditScore, setCreditScore] = useState(700);
  const [loanAmount, setLoanAmount] = useState(18000);
  const [employmentLength, setEmploymentLength] = useState(5);
  const [purpose, setPurpose] = useState("personal");
  const [showResult, setShowResult] = useState(false);
  const [computing, setComputing] = useState(false);

  const result = useMemo(
    () =>
      predictDefault({ income, dti, creditScore, loanAmount, employmentLength, purpose }),
    [income, dti, creditScore, loanAmount, employmentLength, purpose]
  );

  const handlePredict = () => {
    setShowResult(false);
    setComputing(true);
    setTimeout(() => {
      setComputing(false);
      setShowResult(true);
    }, 1000);
  };

  const loadProfile = (p: (typeof sampleProfiles)[0]) => {
    setIncome(p.income);
    setDTI(p.dti);
    setCreditScore(p.creditScore);
    setLoanAmount(p.loanAmount);
    setEmploymentLength(p.employmentLength);
    setPurpose(p.purpose);
    setShowResult(false);
  };

  const verdict =
    result.probability < 30
      ? { signal: "LOW", text: "Applicant profile within acceptable risk parameters.", color: "text-green-400" }
      : result.probability < 60
        ? { signal: "MODERATE", text: "Elevated risk detected. Manual review recommended before approval.", color: "text-amber-400" }
        : { signal: "HIGH", text: `Signal: HIGH risk. Primary driver: ${result.contributions[0].feature.toLowerCase()}.`, color: "text-red-400" };

  return (
    <div className="space-y-6">
      {/* Input form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-mono text-xs text-foreground/40 block mb-1">
            Annual Income: ${income.toLocaleString()}
          </label>
          <input
            type="range"
            min={15000}
            max={200000}
            step={5000}
            value={income}
            onChange={(e) => { setIncome(Number(e.target.value)); setShowResult(false); }}
            className="w-full accent-accent"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-foreground/40 block mb-1">
            Debt-to-Income Ratio: {dti}%
          </label>
          <input
            type="range"
            min={0}
            max={60}
            value={dti}
            onChange={(e) => { setDTI(Number(e.target.value)); setShowResult(false); }}
            className="w-full accent-accent"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-foreground/40 block mb-1">
            Credit Score: {creditScore}
          </label>
          <input
            type="range"
            min={300}
            max={850}
            step={10}
            value={creditScore}
            onChange={(e) => { setCreditScore(Number(e.target.value)); setShowResult(false); }}
            className="w-full accent-accent"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-foreground/40 block mb-1">
            Loan Amount: ${loanAmount.toLocaleString()}
          </label>
          <input
            type="range"
            min={1000}
            max={50000}
            step={1000}
            value={loanAmount}
            onChange={(e) => { setLoanAmount(Number(e.target.value)); setShowResult(false); }}
            className="w-full accent-accent"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-foreground/40 block mb-1">
            Employment Length: {employmentLength} years
          </label>
          <input
            type="range"
            min={0}
            max={15}
            value={employmentLength}
            onChange={(e) => { setEmploymentLength(Number(e.target.value)); setShowResult(false); }}
            className="w-full accent-accent"
          />
        </div>
        <div>
          <label className="font-mono text-xs text-foreground/40 block mb-1">
            Loan Purpose
          </label>
          <select
            value={purpose}
            onChange={(e) => { setPurpose(e.target.value); setShowResult(false); }}
            className="w-full bg-surface border border-surface-border rounded-lg px-3 py-2 font-mono text-xs text-foreground/60 outline-none focus:border-accent/30"
          >
            <option value="mortgage">Mortgage</option>
            <option value="education">Education</option>
            <option value="medical">Medical</option>
            <option value="debt consolidation">Debt Consolidation</option>
            <option value="business">Business</option>
            <option value="personal">Personal</option>
          </select>
        </div>
      </div>

      {/* Sample profiles + predict button */}
      <div className="flex items-center gap-3 flex-wrap">
        <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/30">
          Try:
        </span>
        {sampleProfiles.map((p) => (
          <button
            key={p.label}
            onClick={() => loadProfile(p)}
            className="font-mono text-xs px-3 py-1.5 rounded-lg border border-surface-border text-foreground/40 hover:border-accent/30 hover:text-foreground/60 transition-all"
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={handlePredict}
          className="font-mono text-xs px-5 py-2 rounded-lg bg-accent text-white hover:bg-accent-dark transition-colors ml-auto"
        >
          predict()
        </button>
      </div>

      {/* Computing animation */}
      <AnimatePresence>
        {computing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 py-8 justify-center"
          >
            <motion.div
              className="w-2 h-2 rounded-full bg-accent-light"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            />
            <span className="font-mono text-xs text-accent-light/60">
              computing risk assessment...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Result */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Gauge */}
              <div className="flex justify-center">
                <ProbabilityGauge value={result.probability} />
              </div>

              {/* Feature contributions */}
              <div>
                <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
                  feature contributions
                </div>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={result.contributions}
                      layout="vertical"
                      margin={{ top: 0, right: 10, bottom: 0, left: 80 }}
                    >
                      <CartesianGrid stroke={chartColors.grid} strokeDasharray="3 3" horizontal={false} />
                      <XAxis
                        type="number"
                        tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                        axisLine={{ stroke: chartColors.grid }}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="feature"
                        tick={{ fill: chartColors.axisText, fontSize: 10, fontFamily: "monospace" }}
                        axisLine={{ stroke: chartColors.grid }}
                        tickLine={false}
                        width={80}
                      />
                      <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                        {result.contributions.map((entry, i) => (
                          <Cell
                            key={i}
                            fill={entry.value > 0 ? chartColors.red : chartColors.green}
                            fillOpacity={0.7}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Verdict */}
            <div className={`rounded-xl border border-surface-border bg-surface/80 p-4 ${verdict.color}`}>
              <div className="font-mono text-xs">
                <span className="uppercase tracking-widest opacity-50">Verdict: </span>
                {verdict.text}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

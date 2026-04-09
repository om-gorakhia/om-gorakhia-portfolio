"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { chartColors } from "../ChartTheme";

interface Scenario {
  id: string;
  label: string;
  patient: string;
  steps: string[];
  recommendation: {
    risk: "LOW" | "MODERATE" | "HIGH";
    title: string;
    actions: string[];
    guideline: string;
  };
}

const scenarios: Scenario[] = [
  {
    id: "hypertension",
    label: "45yo male, hypertension, missed dose",
    patient: "Rajesh K., 45M — Stage 2 Hypertension, on Amlodipine 10mg + Losartan 50mg",
    steps: [
      "retrieving patient history from EHR...",
      "patient missed morning dose of Amlodipine 10mg (12h ago)",
      "checking current vitals: BP 158/96 mmHg (elevated)",
      "querying clinical guidelines: JNC-8 hypertension protocol",
      "checking medication interactions: Amlodipine + Losartan — no contraindication",
      "evaluating risk: missed dose + elevated BP = moderate acute risk",
      "checking renal function: eGFR 72 mL/min — no dose adjustment needed",
      "drafting recommendation based on guideline match...",
      "self-critique: verify recommendation doesn't exceed single-dose maximum",
      "finalizing recommendation with monitoring plan",
    ],
    recommendation: {
      risk: "MODERATE",
      title: "Missed Dose Protocol — Amlodipine",
      actions: [
        "Take the missed Amlodipine 10mg dose now (within 12h window: safe)",
        "Resume normal schedule tomorrow morning",
        "Monitor BP every 4 hours for next 24h",
        "If BP exceeds 180/110, seek emergency care",
        "Schedule follow-up with cardiologist within 1 week",
      ],
      guideline: "JNC-8 §4.2 — Missed dose recovery for CCB class agents",
    },
  },
  {
    id: "diabetes",
    label: "Elderly diabetic, hypoglycemia risk",
    patient: "Meera S., 72F — Type 2 Diabetes, on Metformin 1000mg + Glimepiride 2mg",
    steps: [
      "retrieving patient history from EHR...",
      "patient reports dizziness and tremors 2h post-meal",
      "checking glucose log: fasting 68 mg/dL (below threshold)",
      "querying clinical guidelines: ADA hypoglycemia management",
      "flagging drug interaction: Glimepiride (sulfonylurea) — known hypoglycemia risk in elderly",
      "checking renal function: eGFR 48 mL/min — reduced clearance amplifies risk",
      "evaluating risk: age + renal impairment + sulfonylurea = HIGH hypoglycemia risk",
      "querying alternative regimens: DPP-4 inhibitors as safer substitute",
      "drafting recommendation: immediate glucose correction + regimen review...",
      "self-critique: ensure 15-15 rule compliance in recommendation",
      "finalizing with endocrinologist escalation flag",
    ],
    recommendation: {
      risk: "HIGH",
      title: "Hypoglycemia Alert — Immediate Action Required",
      actions: [
        "IMMEDIATE: Consume 15g fast-acting carbohydrate (glucose tablets or juice)",
        "Recheck blood glucose in 15 minutes — repeat if still below 70 mg/dL",
        "Hold Glimepiride dose until endocrinologist review",
        "Continue Metformin as scheduled",
        "Flag for regimen change: consider switching Glimepiride to Sitagliptin 50mg (renal-adjusted)",
        "Urgent endocrinologist consult within 48 hours",
      ],
      guideline: "ADA Standards of Care 2026 §6.6 — Hypoglycemia in Older Adults",
    },
  },
  {
    id: "asthma",
    label: "Pediatric asthma flare",
    patient: "Arjun P., 8M — Moderate Persistent Asthma, on Fluticasone 110mcg + PRN Albuterol",
    steps: [
      "retrieving patient history from EHR...",
      "parent reports: nighttime cough x3 nights, rescue inhaler used 4x in past week",
      "checking asthma control assessment: ACT score estimated 14 (not well controlled)",
      "querying clinical guidelines: GINA 2026 stepwise approach",
      "current step: Step 2 (low-dose ICS) — criteria for step-up met",
      "checking growth monitoring: height velocity normal — no ICS growth concern at current dose",
      "evaluating risk: step-up to Step 3 recommended (add LABA or increase ICS)",
      "checking age-appropriate options: LABA approved for age 4+",
      "drafting recommendation: step-up therapy + action plan revision...",
      "self-critique: verify spacer technique before attributing to medication failure",
      "finalizing with school nurse notification flag",
    ],
    recommendation: {
      risk: "MODERATE",
      title: "Asthma Step-Up — Therapy Adjustment",
      actions: [
        "Verify inhaler technique with spacer — poor technique mimics treatment failure",
        "If technique is adequate: step up to Fluticasone/Salmeterol 115/21mcg (Step 3)",
        "Continue PRN Albuterol for acute symptoms",
        "Update Asthma Action Plan with new yellow/red zone thresholds",
        "Schedule pulmonologist follow-up in 2-4 weeks to assess response",
        "Notify school nurse of medication change",
      ],
      guideline: "GINA 2026 §3.3 — Stepwise Management in Children 6-11 years",
    },
  },
  {
    id: "wound",
    label: "Post-surgical wound monitoring",
    patient: "David L., 58M — Day 5 post-laparoscopic cholecystectomy, on Cefazolin prophylaxis",
    steps: [
      "retrieving surgical notes and post-op record...",
      "patient reports: increasing redness and warmth around port site #2",
      "checking wound photo analysis: erythema radius 2.5cm (expanded from 1cm at Day 2)",
      "querying clinical guidelines: NICE surgical site infection criteria",
      "checking vital signs: temp 37.8°C, WBC 11.2 — borderline elevation",
      "evaluating SSI risk factors: BMI 31, diabetes (HbA1c 7.2%) — elevated baseline risk",
      "checking antibiotic coverage: Cefazolin appropriate for gram+ surgical prophylaxis",
      "wound classification: possible superficial incisional SSI (CDC criteria: 2 of 4 met)",
      "drafting recommendation: wound culture + antibiotic escalation consideration...",
      "self-critique: differentiate SSI from normal inflammatory healing response",
      "finalizing with surgeon notification",
    ],
    recommendation: {
      risk: "MODERATE",
      title: "Possible Surgical Site Infection — Monitoring Escalation",
      actions: [
        "Obtain wound swab culture from port site #2 before any antibiotic change",
        "Continue Cefazolin pending culture results",
        "Mark erythema border with skin marker — remeasure in 12 hours",
        "If erythema expands or systemic signs develop: escalate to IV Piperacillin-Tazobactam",
        "Daily wound photography for objective tracking",
        "Notify operating surgeon within 24 hours",
      ],
      guideline: "NICE CG74 §1.5 — Surgical Site Infection Surveillance",
    },
  },
];

// --- Architecture diagram as inline SVG ---
function ArchitectureDiagram() {
  const boxes = [
    { x: 20, y: 10, label: "Patient\nInput", color: chartColors.accentLight },
    { x: 180, y: 10, label: "RAG\nRetrieval", color: chartColors.accent },
    { x: 340, y: 10, label: "Reasoning\nAgent", color: chartColors.accent },
    { x: 500, y: 10, label: "Safety\nCheck", color: chartColors.red },
    { x: 340, y: 80, label: "Clinical\nGuidelines", color: "rgba(255,255,255,0.2)" },
    { x: 500, y: 80, label: "Drug\nDatabase", color: "rgba(255,255,255,0.2)" },
    { x: 660, y: 10, label: "Output\nAgent", color: chartColors.green },
  ];

  return (
    <div className="mt-6">
      <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
        agent architecture
      </div>
      <svg viewBox="0 0 780 140" className="w-full h-auto" style={{ maxHeight: 140 }}>
        {/* Connections */}
        <line x1="100" y1="30" x2="180" y2="30" stroke={chartColors.accent} strokeWidth="1.5" opacity="0.5" />
        <line x1="260" y1="30" x2="340" y2="30" stroke={chartColors.accent} strokeWidth="1.5" opacity="0.5" />
        <line x1="420" y1="30" x2="500" y2="30" stroke={chartColors.accent} strokeWidth="1.5" opacity="0.5" />
        <line x1="580" y1="30" x2="660" y2="30" stroke={chartColors.accent} strokeWidth="1.5" opacity="0.5" />
        {/* Vertical connections to data stores */}
        <line x1="260" y1="40" x2="340" y2="90" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="500" y1="40" x2="500" y2="80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="4 4" />
        {/* Reasoning loop */}
        <path d="M 380 45 Q 380 65 360 65 Q 340 65 340 45" fill="none" stroke={chartColors.accentLight} strokeWidth="1" opacity="0.4" />
        <text x="390" y="60" fill={chartColors.axisText} fontSize="8" fontFamily="monospace">loop</text>

        {/* Arrow heads */}
        {[140, 300, 460, 620].map((x) => (
          <polygon key={x} points={`${x + 38},30 ${x + 32},26 ${x + 32},34`} fill={chartColors.accent} opacity="0.5" />
        ))}

        {boxes.map((box, i) => (
          <g key={i}>
            <rect
              x={box.x}
              y={box.y}
              width={80}
              height={45}
              rx={6}
              fill="rgba(255,255,255,0.02)"
              stroke={box.color}
              strokeWidth="1"
              opacity="0.6"
            />
            {box.label.split("\n").map((line, j) => (
              <text
                key={j}
                x={box.x + 40}
                y={box.y + 20 + j * 14}
                textAnchor="middle"
                fill={box.color}
                fontSize="9"
                fontFamily="monospace"
              >
                {line}
              </text>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}

export function AgentTheater() {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);
  const [visibleSteps, setVisibleSteps] = useState<number>(0);
  const [showRecommendation, setShowRecommendation] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scenario = scenarios.find((s) => s.id === selectedScenario);

  const startScenario = useCallback((id: string) => {
    setSelectedScenario(id);
    setVisibleSteps(0);
    setShowRecommendation(false);
  }, []);

  useEffect(() => {
    if (!scenario || visibleSteps >= scenario.steps.length) {
      if (scenario && visibleSteps >= scenario.steps.length) {
        const timer = setTimeout(() => setShowRecommendation(true), 600);
        return () => clearTimeout(timer);
      }
      return;
    }

    const delay = 400 + Math.random() * 400;
    const timer = setTimeout(() => setVisibleSteps((v) => v + 1), delay);
    return () => clearTimeout(timer);
  }, [scenario, visibleSteps]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [visibleSteps, showRecommendation]);

  const riskColor = {
    LOW: "text-green-400 border-green-400/30 bg-green-400/5",
    MODERATE: "text-amber-400 border-amber-400/30 bg-amber-400/5",
    HIGH: "text-red-400 border-red-400/30 bg-red-400/5",
  };

  return (
    <div className="space-y-6">
      {/* Scenario selector */}
      <div>
        <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-3">
          select patient scenario
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => startScenario(s.id)}
              className={`text-left font-mono text-xs px-4 py-3 rounded-xl border transition-all ${
                selectedScenario === s.id
                  ? "border-accent bg-accent/10 text-accent-light"
                  : "border-surface-border text-foreground/40 hover:border-accent/30 hover:text-foreground/60"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Agent reasoning stream */}
      {scenario && (
        <div>
          <div className="font-mono text-[10px] uppercase tracking-widest text-foreground/30 mb-2">
            agent reasoning — {scenario.patient}
          </div>
          <div
            ref={scrollRef}
            className="rounded-xl border border-surface-border bg-[#060710] p-4 h-72 md:h-80 overflow-y-auto"
          >
            <div className="font-mono text-xs text-accent/60 mb-2">
              $ synpulse --evaluate --patient={scenario.id}
            </div>

            <AnimatePresence>
              {scenario.steps.slice(0, visibleSteps).map((step, i) => (
                <motion.div
                  key={`${scenario.id}-${i}`}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-start gap-2 mb-1.5"
                >
                  <span className="text-accent-light/40 shrink-0">▸</span>
                  <span className="text-foreground/50 font-mono text-xs">
                    {step}
                  </span>
                  {i === visibleSteps - 1 && visibleSteps < scenario.steps.length && (
                    <motion.span
                      className="inline-block w-1.5 h-3 bg-accent-light/60 ml-1"
                      animate={{ opacity: [1, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6 }}
                    />
                  )}
                </motion.div>
              ))}

              {/* Loading indicator */}
              {visibleSteps < scenario.steps.length && (
                <motion.div
                  className="flex items-center gap-2 mt-2"
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-light" />
                  <span className="font-mono text-[10px] text-accent-light/40">processing...</span>
                </motion.div>
              )}

              {/* Recommendation card */}
              {showRecommendation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className={`mt-4 rounded-xl border p-4 ${riskColor[scenario.recommendation.risk]}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded border">
                      {scenario.recommendation.risk} RISK
                    </span>
                    <span className="font-mono text-sm font-semibold">
                      {scenario.recommendation.title}
                    </span>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {scenario.recommendation.actions.map((action, i) => (
                      <li key={i} className="flex gap-2 font-mono text-xs">
                        <span className="shrink-0 opacity-50">{i + 1}.</span>
                        <span className="text-foreground/70">{action}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="font-mono text-[10px] text-foreground/30 border-t border-current/10 pt-2 mt-2">
                    Source: {scenario.recommendation.guideline}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      <ArchitectureDiagram />
    </div>
  );
}

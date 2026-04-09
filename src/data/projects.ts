import type { Repo } from "@/lib/types";

export interface ProjectDetail {
  slug: string;
  title: string;
  description: string;
  language: string;
  url: string;
  domain: string;
  techniques: string[];
  datasetScale: string;
  role: string;
  whatItDoes: string[];
  techStack: string[];
  architectureNotes: string[];
}

export const projectDetails: Record<string, ProjectDetail> = {
  "nse-algo-trading-system": {
    slug: "nse-algo-trading-system",
    title: "NSE Algo Trading System",
    description:
      "Automated stock trading system for Indian NSE markets. Screens 2400+ stocks daily across 10 strategies with multi-checkpoint validation.",
    language: "Python",
    url: "https://github.com/om-gorakhia/nse-algo-trading-system",
    domain: "Quantitative Finance",
    techniques: ["Technical Analysis", "Signal Processing", "Backtesting", "Portfolio Optimization"],
    datasetScale: "2400+ NSE-listed stocks, daily OHLCV",
    role: "Solo Developer",
    whatItDoes: [
      "The Indian stock market moves fast — 2400+ listed equities, each generating a new candle every day. Manually scanning for setups across that universe is impossible. This system automates the entire pipeline: ingest, screen, validate, and surface only the highest-conviction trades.",
      "Under the hood, ten distinct strategy modules run in parallel — momentum breakouts, mean reversion, RSI divergence, volume spikes, moving average crossovers, and more. Each candidate signal passes through a multi-checkpoint validation gate before it surfaces. The system doesn't just find patterns; it stress-tests them.",
      "The output is a daily briefing: ranked trade candidates with entry/exit levels, position sizing via Kelly Criterion, and a backtest performance snapshot for each strategy. It turns a 2400-stock haystack into a 5-10 trade shortlist every morning.",
    ],
    techStack: ["Python", "pandas", "NumPy", "yfinance", "Plotly", "Streamlit"],
    architectureNotes: [
      "Pipeline architecture: data ingestion → strategy modules → validation gate → ranking → output. Each strategy is a pluggable module conforming to a common interface.",
      "Backtester runs walk-forward optimization to avoid overfitting. Position sizing uses fractional Kelly with a 0.5x safety multiplier.",
      "Screener uses vectorized pandas operations across all 2400+ stocks simultaneously — no row-level loops.",
    ],
  },
  "sports-bet-portfolio": {
    slug: "sports-bet-portfolio",
    title: "Sports Bet Portfolio",
    description:
      "IPL in-play betting hedge calculator. Mean-variance optimisation, Kelly Criterion, and Gemini AI for real-time cricket betting.",
    language: "Python",
    url: "https://github.com/om-gorakhia/sports-bet-portfolio",
    domain: "Sports Analytics",
    techniques: ["Kelly Criterion", "Mean-Variance Optimization", "Hedging", "Gemini AI"],
    datasetScale: "Real-time IPL odds feeds",
    role: "Solo Developer",
    whatItDoes: [
      "Sports betting is a market — and like any market, the edge comes from portfolio thinking, not individual bets. This tool treats a bettor's open positions like an investment portfolio and applies the same mathematical frameworks: Kelly Criterion for optimal sizing, mean-variance optimization for diversification, and dynamic hedging for risk control.",
      "The core innovation is the in-play hedge calculator. As a cricket match unfolds — wickets fall, run rates shift — the odds move. The system monitors these shifts and identifies the exact moment and stake to place a counter-bet that locks in guaranteed profit regardless of the match outcome. It turns a speculative bet into an arbitrage.",
      "Gemini AI is integrated as a reasoning layer: it reads match context (pitch conditions, batting order, momentum) and generates probability adjustments that feed into the Kelly calculator. The result is a human-readable recommendation with the math visible behind it.",
    ],
    techStack: ["Python", "Streamlit", "Gemini AI", "NumPy", "Plotly"],
    architectureNotes: [
      "Three-layer architecture: data layer (odds feeds), math layer (Kelly + mean-variance), and AI layer (Gemini for contextual adjustment).",
      "Hedge calculator uses binary outcome payoff matrices — pre-match bet + in-play hedge = guaranteed profit band.",
      "Portfolio frontier computed via constrained optimization (scipy.optimize) across correlated bets.",
    ],
  },
  synpulse: {
    slug: "synpulse",
    title: "Synpulse — Agentic AI for Healthcare",
    description:
      "Agentic AI for Chronic Disease Management — NUS-Synapxe-IMDA AI Innovation Challenge 2026.",
    language: "Python",
    url: "https://github.com/om-gorakhia/synpulse",
    domain: "Healthcare AI",
    techniques: ["Agentic AI", "RAG", "Clinical NLP", "Multi-Agent Orchestration"],
    datasetScale: "Clinical guidelines + patient records",
    role: "Team Lead — 4-person team",
    whatItDoes: [
      "Chronic disease management is a coordination nightmare — patients juggle multiple medications, forget doses, misread symptoms, and fall through the cracks between appointments. Synpulse is an agentic AI system that acts as a 24/7 clinical copilot for patients with chronic conditions like diabetes, hypertension, and asthma.",
      "The system uses a multi-agent architecture: a retrieval agent pulls relevant clinical guidelines and patient history, a reasoning agent evaluates the current situation against those guidelines, a safety agent checks for medication interactions and contraindications, and an output agent drafts a structured recommendation in patient-friendly language.",
      "Built for the NUS-Synapxe-IMDA AI Innovation Challenge 2026, it demonstrates how agentic AI can bridge the gap between clinical knowledge (buried in PDFs and databases) and patient action (simple, timely, personalized nudges). Every recommendation is traceable back to the guidelines that informed it.",
    ],
    techStack: ["Python", "LangChain", "GPT-4", "ChromaDB", "FastAPI"],
    architectureNotes: [
      "Multi-agent orchestration: Retrieval Agent → Reasoning Agent → Safety Agent → Output Agent. Each agent has a defined role and passes structured data to the next.",
      "RAG pipeline: clinical guidelines chunked and embedded in ChromaDB, retrieved with hybrid search (semantic + keyword).",
      "Safety layer runs medication interaction checks against a curated drug database before any recommendation is finalized.",
    ],
  },
  "loan-default-prediction": {
    slug: "loan-default-prediction",
    title: "Loan Default Prediction",
    description:
      "ML model for loan default prediction with contextual loss evaluation and interactive Streamlit dashboard.",
    language: "Python",
    url: "https://github.com/om-gorakhia/loan-default-prediction",
    domain: "Credit Risk",
    techniques: ["Logistic Regression", "XGBoost", "SHAP", "Cost-Sensitive Learning"],
    datasetScale: "50,000+ loan records",
    role: "Solo Developer",
    whatItDoes: [
      "When a bank approves a loan, it's making a bet — and the cost of losing that bet (default) is asymmetric. Missing a high-risk applicant costs far more than rejecting a borderline one. This project builds a default prediction model that explicitly accounts for that asymmetry through contextual loss evaluation.",
      "The model pipeline runs standard feature engineering (income ratios, credit utilization, employment stability) through both logistic regression and XGBoost, then uses SHAP values to make every prediction explainable. A loan officer doesn't just see 'high risk' — they see exactly which factors drove that assessment and by how much.",
      "The interactive dashboard lets users explore the model's behavior: adjust applicant profiles, see how predictions shift, compare model explanations side by side. It's designed to build trust in the model by making its reasoning transparent.",
    ],
    techStack: ["Python", "scikit-learn", "XGBoost", "SHAP", "Streamlit", "pandas"],
    architectureNotes: [
      "Two-model ensemble: logistic regression (interpretable baseline) + XGBoost (performance). Final prediction blends both with learned weights.",
      "Cost-sensitive learning: custom loss function weights false negatives (missed defaults) at 5x false positives.",
      "SHAP waterfall charts generated per-prediction for feature-level explainability.",
    ],
  },
  "econometric-modeling-demand-analysis": {
    slug: "econometric-modeling-demand-analysis",
    title: "Econometric Demand Analysis",
    description:
      "Demand function estimation for train travel. Market segmentation and dynamic pricing via econometric modeling.",
    language: "Python",
    url: "https://github.com/om-gorakhia/econometric-modeling-demand-analysis",
    domain: "Transport Economics",
    techniques: ["Econometric Modeling", "Price Elasticity", "Market Segmentation", "Revenue Optimization"],
    datasetScale: "National rail demand dataset",
    role: "Solo Developer",
    whatItDoes: [
      "How much does a 10% price increase reduce train ridership? The answer depends entirely on who's riding. Business commuters barely flinch; leisure travelers switch to buses. This project estimates segment-specific demand functions for train travel using econometric methods, then uses those functions to find revenue-maximizing prices.",
      "The core model is a log-linear demand function estimated via OLS and 2SLS (to handle price endogeneity). Separate elasticity estimates for four market segments — business travelers, leisure, commuters, and students — reveal dramatically different price sensitivities. The business segment is almost perfectly inelastic; the student segment is elastic enough that price cuts actually increase revenue.",
      "The pricing optimization layer takes these estimated elasticities and computes the revenue-maximizing price for each segment, subject to capacity constraints. The result is a dynamic pricing matrix that a rail operator could implement directly.",
    ],
    techStack: ["Python", "statsmodels", "scipy", "pandas", "Matplotlib", "Seaborn"],
    architectureNotes: [
      "Estimation pipeline: data cleaning → instrument selection → 2SLS estimation → elasticity extraction → revenue optimization.",
      "Endogeneity handled via instrumental variables (fuel prices, competitor fares) to get causal price elasticity estimates.",
      "Revenue optimization uses constrained nonlinear programming (scipy.optimize.minimize) with capacity bounds.",
    ],
  },
  "Banking-AI-advisor": {
    slug: "Banking-AI-advisor",
    title: "PulseFi — Gen Z Banking Dashboard",
    description:
      "Smart banking dashboard with FHI scoring, Gemini AI recommendations, and 2,000 synthetic Gen Z user profiles. Zero backend — runs entirely in the browser.",
    language: "JavaScript",
    url: "https://github.com/om-gorakhia/Banking-AI-advisor",
    domain: "FinTech / AI",
    techniques: ["Logistic Regression (L1)", "K-Means Clustering", "Gemini Flash Lite", "Canvas Rendering"],
    datasetScale: "2,000 synthetic Gen Z profiles (Singapore)",
    role: "Solo Developer",
    whatItDoes: [
      "Most banking apps show your balance and call it a day. PulseFi goes further — it computes a Financial Health Index (FHI) score using a 6-step ML pipeline, assigns you a money personality, and surfaces AI-generated recommendations via Gemini Flash Lite. All of this runs entirely in the browser with no backend, no build step, and no npm.",
      "The FHI engine is the brain: it takes 11 financial inputs, normalizes them into 8 feature scores (net worth ratio, DTI, savings rate, investment ratio, emergency fund coverage, spending ratio, spending volatility, panic sell tendency), applies Logistic Regression L1 coefficients to produce both a Baseline and Enhanced FHI score, then clusters the user into one of four money personality archetypes using K-Means with pre-computed centroids.",
      "The dashboard has six fully wired screens — Home, Financial Health, Pulse AI, FHI Engine, Savings Goals, and Investments. Every financial action (send money, pay bills, top up, add to goals) updates balances in real time and silently recalculates the FHI score across all screens. It's designed for 18-30 year olds in Singapore, with investment behavior carrying 59% of the FHI weight based on research showing it's the strongest predictor of long-term financial resilience.",
    ],
    techStack: ["JavaScript", "HTML/CSS", "Canvas API", "Gemini Flash Lite", "Vercel"],
    architectureNotes: [
      "Zero-dependency frontend: vanilla JS, no React, no build tools. Charts rendered with Canvas API. Entire app is a single HTML file with modular JS files.",
      "FHI pipeline: preprocessing → feature standardization → L1 logistic regression (baseline + enhanced) → XGBoost validation (3 models, AUC 0.67) → K-Means clustering (K=4, silhouette 0.225) → localStorage persistence.",
      "AI recommendations pre-generated via batch Gemini Flash Lite calls against the full 2,000-user dataset, stored as static JSON — no API key needed at runtime.",
    ],
  },
  "Ecommerce_Warehouse_Optimization": {
    slug: "Ecommerce_Warehouse_Optimization",
    title: "E-Commerce Warehouse Optimizer",
    description:
      "Supply chain optimization using linear programming to minimize warehouse costs and improve distribution efficiency.",
    language: "Python",
    url: "https://github.com/om-gorakhia/Ecommerce_Warehouse_Optimization",
    domain: "Operations Research",
    techniques: ["Linear Programming", "Network Flow", "Cost Minimization", "Scenario Analysis"],
    datasetScale: "6 warehouses × 10 regions × 300+ products",
    role: "Team Lead — 5-person team",
    whatItDoes: [
      "An e-commerce company with 6 warehouses, 10 delivery regions, and 300+ products was running at 45% order fulfillment — more than half of all orders resulted in stockouts. The root cause: inventory was allocated by gut feel, not math. This project formulates the allocation problem as a linear program and solves it to optimality.",
      "The optimization model minimizes total system cost (transportation + holding + stockout penalties) subject to capacity, demand, and service-level constraints. The key insight was modeling inventory as continuous flow capacity rather than static stock — a 50,000-unit warehouse turning over 12× per year has 600,000 units of annual flow capacity, not 50,000.",
      "The result: fulfillment jumped from 45% to 99%+, stockouts dropped below 5%, and annual profit improved by $44.9M. The system also identified a $3.7M transportation cost savings opportunity through carrier renegotiation. Nine scenario analyses (capacity expansion, cost changes, higher service targets) provide a decision playbook for the operations team.",
    ],
    techStack: ["Python", "PuLP", "pandas", "Plotly", "Streamlit", "NumPy"],
    architectureNotes: [
      "Multi-commodity network flow LP: decision variables x[i,j,p] for shipments from warehouse i to region j for product p, with stockout slack variables.",
      "Objective: minimize Σ transport_cost × shipments + Σ holding_cost × inventory + Σ penalty × stockouts. Solved with CBC (branch-and-cut) in ~2 seconds.",
      "Scenario engine runs 9 variants (capacity ±10-30%, transport cost ±10-20%, service target 95-99%) and compares KPIs in a unified dashboard.",
    ],
  },
};

export const projectSlugs = Object.keys(projectDetails);

export function getProjectFromRepo(repo: Repo): ProjectDetail | null {
  return projectDetails[repo.name] ?? null;
}

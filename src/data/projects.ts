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
};

export const projectSlugs = Object.keys(projectDetails);

export function getProjectFromRepo(repo: Repo): ProjectDetail | null {
  return projectDetails[repo.name] ?? null;
}

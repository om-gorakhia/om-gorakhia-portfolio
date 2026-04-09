import type { ResumeData, TimelineEntry } from "@/lib/types";

export const resume: ResumeData = {
  fullName: "Om Gorakhia",
  email: "om.gorakhia@u.nus.edu",
  github: "https://github.com/om-gorakhia",
  linkedin: "https://linkedin.com/in/omgorakhia",
  tagline: "I turn messy data into systems that decide.",
  education: [
    {
      institution: "NUS Business School, National University of Singapore",
      degree: "Master of Science in Business Analytics",
      location: "Singapore",
      dates: "Jul 2025 – Present",
    },
    {
      institution: "Pandit Deendayal Energy University",
      degree: "B.Tech in Information and Communication Technology",
      location: "Ahmedabad, India",
      dates: "Aug 2019 – May 2023",
    },
  ],
  experience: [
    {
      title: "Junior Business Analyst (Data Modeling & Automation)",
      company: "InfoAnalytica",
      dates: "Feb 2023 – Apr 2025",
      highlights: [
        "Built predictive GMS forecasting for Shopify/WooCommerce/BigCommerce merchants — 45+ customer segments via ML",
        "Designed LLM-powered lead qualification platform — 40% improvement in conversion rates",
        "Delivered data intelligence for Amazon, Walmart, and PayPal — $2M+ in client insights",
        "Led team of 4 data engineering interns on proprietary analytics platform",
      ],
    },
  ],
  skills: {
    "AI & ML": ["LLMs", "NLP", "Prompt Engineering", "TensorFlow", "Hugging Face", "Generative AI", "Sentence Transformers"],
    "Analytics": ["Statistical Modeling", "Predictive Analytics", "Regression", "A/B Testing", "Data Mining"],
    "Engineering": ["Python", "R", "SQL", "PostgreSQL", "API Integration", "ETL", "Git"],
    "Platforms": ["N8N", "Power BI", "Power Apps", "Streamlit"],
  },
};

export const timeline: TimelineEntry[] = [
  {
    date: "2026",
    title: "Building autonomous AI systems",
    description: "Algo trading, agentic AI for healthcare, quantitative modeling",
  },
  {
    date: "2025",
    title: "Moved to Singapore for MSBA",
    description: "NUS Business School — Business Analytics",
  },
  {
    date: "2024",
    title: "Led data engineering team",
    description: "Managed 4 interns, shipped proprietary analytics platform",
  },
  {
    date: "2024",
    title: "Built LLM-powered lead platform",
    description: "40% conversion lift — served Amazon, Walmart, PayPal",
  },
  {
    date: "2023",
    title: "Joined InfoAnalytica",
    description: "Data modeling & automation for B2B marketing consulting",
  },
  {
    date: "2019",
    title: "Started B.Tech in ICT",
    description: "Pandit Deendayal Energy University, Ahmedabad",
  },
];

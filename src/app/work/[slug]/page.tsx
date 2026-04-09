import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { projectDetails, projectSlugs } from "@/data/projects";
import { selectedRepos } from "@/data/github";
import { ProjectLayout } from "@/components/work/ProjectLayout";
import { StrategySandbox } from "@/components/work/sims/StrategySandbox";
import { KellyHedgeLab } from "@/components/work/sims/KellyHedgeLab";
import { AgentTheater } from "@/components/work/sims/AgentTheater";
import { RiskScorer } from "@/components/work/sims/RiskScorer";
import { PricingLab } from "@/components/work/sims/PricingLab";

export function generateStaticParams() {
  return projectSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = projectDetails[slug];
  if (!project) return {};

  return {
    title: `${project.title} — Om Gorakhia`,
    description: project.description,
    openGraph: {
      title: `${project.title} — Om Gorakhia`,
      description: project.description,
      type: "article",
      siteName: "Om Gorakhia",
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.title} — Om Gorakhia`,
      description: project.description,
    },
  };
}

const simulations: Record<string, React.ComponentType> = {
  "nse-algo-trading-system": StrategySandbox,
  "sports-bet-portfolio": KellyHedgeLab,
  synpulse: AgentTheater,
  "loan-default-prediction": RiskScorer,
  "econometric-modeling-demand-analysis": PricingLab,
};

export default async function WorkDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = projectDetails[slug];
  if (!project) notFound();

  const repo = selectedRepos.find((r) => r.name === slug);
  const Simulation = simulations[slug];

  return (
    <ProjectLayout
      project={project}
      stars={repo?.stars ?? 0}
      pushedAt={repo?.pushedAt ?? ""}
      simulationId="simulation"
    >
      {Simulation && <Simulation />}
    </ProjectLayout>
  );
}

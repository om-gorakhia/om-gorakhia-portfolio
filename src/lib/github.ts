import { Octokit } from "@octokit/rest";
import type { Repo } from "./types";

const GITHUB_USERNAME = "om-gorakhia";
const SELECTED_REPO_NAMES = [
  "nse-algo-trading-system",
  "sports-bet-portfolio",
  "synpulse",
  "loan-default-prediction",
  "econometric-modeling-demand-analysis",
  "banking-ai-advisor",
  "Ecommerce_Warehouse_Optimization",
];

const octokit = new Octokit();

export async function fetchSelectedRepos(): Promise<Repo[]> {
  try {
    const { data: allRepos } = await octokit.repos.listForUser({
      username: GITHUB_USERNAME,
      sort: "pushed",
      per_page: 30,
    });

    const selected = SELECTED_REPO_NAMES.map((name) => {
      const repo = allRepos.find((r) => r.name === name);
      if (!repo) return null;
      return {
        name: repo.name,
        description: repo.description || "",
        language: repo.language || "Unknown",
        stars: repo.stargazers_count || 0,
        forks: repo.forks_count || 0,
        pushedAt: repo.pushed_at || "",
        url: repo.html_url,
        topics: repo.topics || [],
      } satisfies Repo;
    }).filter((r): r is Repo => r !== null);

    return selected;
  } catch (error) {
    console.error("Failed to fetch repos from GitHub API:", error);
    return [];
  }
}

export async function fetchMostRecentCommit() {
  try {
    const { data: events } = await octokit.activity.listPublicEventsForUser({
      username: GITHUB_USERNAME,
      per_page: 30,
    });

    const pushEvent = events.find((e) => e.type === "PushEvent");
    if (pushEvent && pushEvent.payload) {
      const payload = pushEvent.payload as {
        commits?: { message: string }[];
      };
      const commits = payload.commits;
      const lastCommit = commits?.[commits.length - 1];
      return {
        repo: pushEvent.repo.name.replace(`${GITHUB_USERNAME}/`, ""),
        message: lastCommit?.message || "commit",
        date: pushEvent.created_at || new Date().toISOString(),
        language: "Python",
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch recent commit:", error);
    return null;
  }
}

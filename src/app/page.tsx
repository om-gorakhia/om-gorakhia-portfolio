import { PageClient } from "@/components/PageClient";
import { fetchSelectedRepos, fetchMostRecentCommit } from "@/lib/github";
import { selectedRepos, githubData } from "@/data/github";

export const revalidate = 3600; // ISR: revalidate every hour

export default async function Home() {
  // Fetch fresh data from GitHub API, fall back to build-time snapshots
  const [liveRepos, liveCommit] = await Promise.all([
    fetchSelectedRepos(),
    fetchMostRecentCommit(),
  ]);

  const repos = liveRepos.length > 0 ? liveRepos : selectedRepos;
  const commit = liveCommit ?? githubData.mostRecentCommit;

  return <PageClient repos={repos} commit={commit} />;
}

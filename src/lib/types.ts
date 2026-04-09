export interface Repo {
  name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  pushedAt: string;
  url: string;
  topics: string[];
}

export interface TimelineEntry {
  date: string;
  title: string;
  description: string;
}

export interface ResumeData {
  fullName: string;
  email: string;
  github: string;
  linkedin: string;
  tagline: string;
  education: {
    institution: string;
    degree: string;
    location: string;
    dates: string;
  }[];
  experience: {
    title: string;
    company: string;
    dates: string;
    highlights: string[];
  }[];
  skills: Record<string, string[]>;
}

export interface GitHubData {
  username: string;
  avatarUrl: string;
  bio: string;
  repos: Repo[];
  mostRecentCommit: {
    repo: string;
    message: string;
    date: string;
    language: string;
  };
}

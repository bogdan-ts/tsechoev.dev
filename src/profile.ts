export type ProfileLink = {
  label: string;
  href: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
};

export type Project = {
  name: string;
  description: string;
};

export type ExperienceRole = {
  title: string;
  company: string;
  period: string;
  location: string;
  bullets: string[];
  stack?: string[];
};

export type Education = {
  school: string;
  degree: string;
  period: string;
};

export type ResumeProfile = {
  name: string;
  role: string;
  location: string;
  summary: string;
  skills: SkillGroup[];
  experience: ExperienceRole[];
  education: Education[];
  projects: Project[];
  links: ProfileLink[];
  resumeHref: string;
};

export const profile: ResumeProfile = {
  name: "Bogdan Tsechoev",
  role: "Senior Fullstack Engineer with backend and platform focus",
  location: "Bangkok, Thailand",
  summary:
    "Senior fullstack engineer with strong backend and platform focus, specializing in Postgres-driven architectures, SQL-first APIs, self-service platforms, infrastructure automation, and production AI workflows.",
  skills: [
    { title: "backend", items: ["typescript", "node.js", "postgresql", "sql", "api design", "pl/pgsql", "postgrest", "python"] },
    { title: "frontend", items: ["react", "next.js", "graphql", "mobx"] },
    { title: "platform", items: ["docker", "kubernetes", "terraform", "ansible", "ci/cd", "gitlab ci", "aws", "gcp", "hetzner", "stripe billing"] },
    { title: "ai", items: ["llm integration", "streaming responses", "tool calling", "rag workflows", "openai", "claude", "gemini", "deepseek"] }
  ],
  experience: [
    {
      title: "Senior Software Engineer",
      company: "Postgres.ai — Database Lab",
      period: "Apr 2024 — Mar 2026",
      location: "Remote",
      bullets: [
        "Designed and implemented Postgres-centric APIs and PL/pgSQL logic powering core platform functionality.",
        "Enabled self-service deployment of the Postgres monitoring stack with multi-cloud provisioning across AWS, GCP, and Hetzner plus subscription billing workflows, cutting setup to a few minutes.",
        "Implemented subscription billing with Stripe webhooks and access-control flows tied directly to platform provisioning.",
        "Standardized CI/CD across multiple repositories and Kubernetes-based deployment workflows across services.",
        "Built customer-facing platform UI and internal tools with React and TypeScript while owning end-to-end delivery from database and backend to rollout.",
        "Integrated multiple LLM providers with streaming responses, tool calling, and RAG workflows for production features."
      ],
      stack: ["typescript", "node.js", "postgresql", "sql", "pl/pgsql", "postgrest", "python", "react", "next.js", "docker", "kubernetes", "ansible", "terraform", "gitlab ci", "aws", "gcp", "hetzner", "stripe"]
    },
    {
      title: "Frontend Developer",
      company: "Avanti Pharma",
      period: "Dec 2020 — Mar 2024",
      location: "Vladivostok, Russia",
      bullets: [
        "Led frontend development of a large-scale e-commerce platform using React, TypeScript, GraphQL, and Next.js.",
        "Built internal business-critical tools including CMS, product management, and order management systems.",
        "Modernized legacy architecture by introducing TypeScript and migrating to functional React patterns.",
        "Improved frontend performance and build workflows, reducing page load time by about 50%."
      ]
    },
    {
      title: "Junior Frontend Developer",
      company: "House VL",
      period: "Jul 2019 — Dec 2020",
      location: "Vladivostok, Russia",
      bullets: [
        "Built e-commerce websites, corporate sites, web portals, and landing pages with Next.js, JavaScript, and jQuery.",
        "Supported legacy projects and estimated implementation timelines for commercial work."
      ]
    }
  ],
  education: [
    {
      school: "Far Eastern Federal University",
      degree: "Master's degree, Computer Science",
      period: "2019 — 2021"
    }
  ],
  projects: [],
  links: [
    { label: "github", href: "https://github.com/bogdan-ts" },
    { label: "linkedin", href: "https://www.linkedin.com/in/bogdan-tsechoev-b7b81b182" }
  ],
  resumeHref: "#resume"
};

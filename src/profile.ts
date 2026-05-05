export type ProfileLink = {
  label: string;
  href: string;
};

export type SkillGroup = {
  title: string;
  items: string[];
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
  email: string;
  phone: string;
  summary: string;
  skills: SkillGroup[];
  experience: ExperienceRole[];
  education: Education[];
  languages: string[];
  links: ProfileLink[];
  resumeHref: string;
};

export const profile: ResumeProfile = {
  name: "Bogdan Tsechoev",
  role: "Senior Fullstack Engineer",
  location: "Bangkok, Thailand",
  email: "tsechoev.bogdan@gmail.com",
  phone: "+66849947639",
  summary:
    "Senior Fullstack Engineer with 7 years of experience building end-to-end systems across frontend and backend, focused on PostgreSQL-backed applications, asynchronous workflows, provisioning, and billing.",
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
        "Replaced manual Docker/CLI-based setup (~10+ steps) with a single-action self-service deployment flow for PostgresAI Monitoring, reducing setup time and removing configuration overhead.",
        "Designed and implemented Stripe-based billing system from scratch, enabling subscription-based access with automated provisioning and access control, handling payment failures via webhooks (notifications, retries, automated deprovisioning), and supporting multiple pricing tiers.",
        "Optimized and standardized CI/CD across 5+ repositories, cutting frontend build time from ~10-15 to ~3 minutes and enabling automated staging and tag-based production deployments on Kubernetes.",
        "Implemented UI for asynchronous workflows, handling operations lasting ~3 minutes with real-time status tracking, progress updates, and error handling to improve user visibility and reduce failed interactions.",
        "Developed real-time AI chat interface with streaming responses, integrating multiple LLM providers (ChatGPT, Claude, Gemini) with sub-second feedback for hundreds of users.",
        "Owned end-to-end delivery of dozens of features across 8+ services, spanning database, backend, frontend, and production rollout.",
        "Led frontend development, owning codebase standards (linting, architecture) and mentoring developers.",
        "Contributed to open-source PostgresAI ecosystem, including DBLab and PostgresAI Monitoring."
      ],
      stack: ["typescript", "postgres", "postgrest", "python", "react", "docker", "kubernetes", "ansible", "terraform", "aws", "gcp"]
    },
    {
      title: "Frontend Developer",
      company: "Avanti Pharma",
      period: "Dec 2020 — Mar 2024",
      location: "Vladivostok, Russia",
      bullets: [
        "Led frontend development of a large-scale e-commerce platform, leading a team of 3 engineers, managing tasks, code reviews, and technical decisions.",
        "Modernized legacy architecture by introducing TypeScript and migrating to modern React patterns.",
        "Built internal business tools (CMS, product and order management) and improved performance, reducing page load time by ~50%."
      ]
    },
    {
      title: "Junior Frontend Developer",
      company: "House VL",
      period: "Jul 2019 — Dec 2020",
      location: "Vladivostok, Russia",
      bullets: [
        "Developed e-commerce and corporate websites using Next.js.",
        "Maintained legacy JavaScript projects."
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
  languages: ["English", "Russian"],
  links: [
    { label: "github", href: "https://github.com/bogdan-ts" },
    { label: "linkedin", href: "https://www.linkedin.com/in/bogdan-tsechoev-b7b81b182" }
  ],
  resumeHref: "/bogdan-tsechoev-resume.pdf"
};

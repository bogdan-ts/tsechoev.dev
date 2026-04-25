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
  role: "Software Engineer / Full Stack Developer",
  location: "Bangkok, Thailand",
  summary:
    "I build production platforms where PostgreSQL is more than storage: backend services, PL/pgSQL, APIs, React + TypeScript frontends, infrastructure automation, and AI workflows that ship to real users.",
  skills: [
    { title: "frontend", items: ["typescript", "react", "next.js", "graphql", "mobx"] },
    { title: "backend", items: ["python", "flask", "api design", "postgresql", "pl/pgsql", "postgrest"] },
    { title: "ai", items: ["llm integration", "streaming responses", "function calling", "rag workflows"] },
    { title: "infra", items: ["docker", "kubernetes", "ansible", "terraform", "gitlab ci", "aws", "gcp"] }
  ],
  experience: [
    {
      title: "Software Engineer",
      company: "Postgres.ai — Database Lab",
      period: "Apr 2024 — Present",
      location: "Remote",
      bullets: [
        "Ship production features across a PostgreSQL-first platform: PL/pgSQL, APIs, backend logic, React + TypeScript UI, migrations, and rollout.",
        "Build AI Assistant functionality with multiple LLM providers, streaming responses, function calling, and RAG-based workflows.",
        "Own infrastructure and delivery work: multi-cloud provisioning, GitLab CI, Kubernetes deployments, and one-click monitoring stack setup."
      ],
      stack: ["typescript", "react", "next.js", "postgresql", "pl/pgsql", "postgrest", "python", "docker", "kubernetes", "ansible", "terraform", "aws", "gcp"]
    },
    {
      title: "Frontend Developer",
      company: "Avanti Pharma",
      period: "Dec 2020 — Mar 2024",
      location: "Hybrid",
      bullets: [
        "Built e-commerce, internal tools, marketing pages, and a React Native app across React, TypeScript, GraphQL, MobX, and Next.js.",
        "Modernized legacy frontend systems: introduced TypeScript, improved build performance, and simplified client-server interactions with GraphQL."
      ]
    },
    {
      title: "Junior Frontend Developer",
      company: "House",
      period: "Jul 2019 — Dec 2020",
      location: "On-site",
      bullets: [
        "Developed e-commerce websites, corporate sites, portals, and landing pages with Next.js, JavaScript, and jQuery."
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

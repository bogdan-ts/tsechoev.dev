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

export type ResumeProfile = {
  name: string;
  role: string;
  summary: string;
  skills: SkillGroup[];
  experience: string[];
  projects: Project[];
  links: ProfileLink[];
  resumeHref: string;
};

export const profile: ResumeProfile = {
  name: "Bogdan",
  role: "Full Stack Developer",
  summary: "I build practical web products end to end, from backend APIs to clean user interfaces.",
  skills: [
    { title: "frontend", items: ["typescript", "react", "html", "css"] },
    { title: "backend", items: ["node.js", "api design", "sql", "postgresql"] },
    { title: "ops", items: ["linux", "git", "github pages", "automation"] }
  ],
  experience: [
    "Full stack development across frontend, backend, databases, and deployment.",
    "Focus on simple systems, maintainable code, and useful product outcomes."
  ],
  projects: [
    {
      name: "personal resume website",
      description: "Minimal terminal-inspired personal website hosted on GitHub Pages."
    }
  ],
  links: [
    { label: "github", href: "https://github.com/bogdan-ts" }
  ],
  resumeHref: "#resume"
};

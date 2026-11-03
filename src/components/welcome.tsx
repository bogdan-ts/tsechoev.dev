import { profile } from "../lib/profile";
import { CommandList, type CommandActionProps } from "./command-list";

export function Welcome({ onCommand }: CommandActionProps) {
  return (
    <div className="welcome">
      <div className="intro">
        <h1>
          I’m Bogdan<span className="accent">.</span>
        </h1>
        <p className="intro-role">Senior Full-Stack Engineer · 7+ years</p>
        <p className="intro-description">
          I build SaaS products and AI tools with React, TypeScript, Python and PostgreSQL.
        </p>
      </div>
      <div className="welcome-help">
        <p className="section-label">Available commands:</p>
        <CommandList onCommand={onCommand} />
      </div>
      <noscript>
        <p>
          Enable JavaScript to enter commands. You can also{" "}
          <a href={profile.resumeHref}>download my CV</a> or{" "}
          <a href={`mailto:${profile.email}`}>email me</a>.
        </p>
      </noscript>
    </div>
  );
}

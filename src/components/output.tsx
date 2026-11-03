import { commands, type CommandResult } from "../lib/commands";
import { countries, profile } from "../lib/profile";

export function CommandList({ onCommand }: { onCommand?: (command: string) => void }) {
  return <div className="command-list">{commands.map((command) => <div className="command-item" key={command.name}>
    {onCommand ? <button type="button" onClick={() => onCommand(command.name)}>{command.name}<span aria-hidden="true">↗</span></button> : <code>{command.name}</code>}
    <span>{command.description}</span>
  </div>)}</div>;
}

export function Output({ result, onCommand }: { result: CommandResult; onCommand?: (command: string) => void }) {
  if (result.kind === "error") return <p className="error">{result.message}</p>;
  if (result.kind === "text") return <p>{result.message}</p>;
  if (result.kind === "history") return <ol className="history-list">{result.entries.map((entry, index) => <li key={index}>{entry}</li>)}</ol>;
  if (result.kind === "theme") return <p>Appearance updated. A different light, the same person.</p>;
  if (result.kind === "clear") return null;
  switch (result.command) {
    case "help": return <><h2>Available commands<span> / help</span></h2><CommandList onCommand={onCommand} /><p className="muted small">Aliases: about → whoami · oss → opensource · resume → cv · countries → travel · ls → help</p></>;
    case "whoami": return <><p className="eyebrow">THE PERSON BEHIND THE PROMPT</p><h2 className="name">{profile.name}<span className="accent">.</span></h2><p className="role">{profile.role}</p><p className="prose">{profile.summary}</p><p className="muted">{profile.location} <span className="separator">/</span> {profile.timezone}</p><div className="metrics">{profile.highlights.map((item) => <div key={item.value}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div></>;
    case "experience": return <><h2>Experience<span> / the work so far</span></h2><div className="timeline">{profile.experience.map((job) => <article key={job.company}><p className="eyebrow">{job.period} · {job.location}</p><h3>{job.company}</h3><p className="accent">{job.role}</p><p>{job.summary}</p><ul>{job.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul></article>)}</div></>;
    case "skills": return <><h2>Skills<span> / tools, not identities</span></h2><div className="skill-groups">{profile.skills.map((group) => <div key={group.title}><h3>{group.title}</h3><p>{group.items.join(" · ")}</p></div>)}</div></>;
    case "opensource": return <><h2>Open source<span> / built in the open</span></h2><p className="muted">Contributions from my work at Postgres.ai. Repository links, not a live contribution feed.</p><div className="repositories">{profile.opensource.map((repo) => <article key={repo.name}><span className="eyebrow">{repo.label}</span><h3><a href={repo.href} target="_blank" rel="noreferrer">{repo.name} ↗</a></h3><p>{repo.description}</p></article>)}</div></>;
    case "education": return <><h2>Education<span> / foundations</span></h2>{profile.education.map((item) => <article className="education" key={item.degree}><p className="eyebrow">{item.period}</p><h3>{item.degree}</h3><p>{item.school} · Vladivostok, Russia</p></article>)}</>;
    case "contact": return <><h2>Let’s talk<span> / human to human</span></h2><p className="muted">{profile.location}. {profile.timezone}.</p><div className="contact-links">{profile.links.map((link) => <a href={link.href} key={link.label}><span>{link.label}</span>{link.text}<span aria-hidden="true">↗</span></a>)}</div></>;
    case "cv": return <><h2>Résumé<span> / the portable version</span></h2><p>My experience, skills, education, and open-source work in one PDF.</p><a className="download-link" href={profile.resumeHref} download="Bogdan-Tsechoev-CV.pdf">↓ Download CV <span>PDF</span></a></>;
    case "travel": return <><h2>Beyond the keyboard<span> / travel log</span></h2>{countries.length ? <ul>{countries.map((country) => <li key={country.code}>{country.name}{country.note ? ` — ${country.note}` : ""}</li>)}</ul> : <div className="pending"><span className="accent">[ work in progress ]</span><p>The travel log is coming. The country list hasn’t been added yet.</p><span className="muted small">No made-up pins on this map.</span></div>}</>;
  }
}

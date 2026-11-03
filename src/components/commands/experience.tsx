import { profile } from "../../lib/profile";

export function ExperienceCommand() {
  return (
    <>
      <h2>Experience</h2>
      <div className="timeline">
        {profile.experience.map(({ company, period, location, role, summary, bullets }) => (
          <article key={company}>
            <p className="eyebrow">{period} · {location}</p>
            <h3>{company}</h3>
            <p className="accent">{role}</p>
            <p>{summary}</p>
            <ul>
              {bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}
            </ul>
          </article>
        ))}
      </div>
    </>
  );
}

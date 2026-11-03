import { profile } from "../../lib/profile";

export function OpenSourceCommand() {
  return (
    <>
      <h2>Open source</h2>
      <p className="muted">I contributed to these projects at Postgres.ai.</p>
      <div className="repositories">
        {profile.opensource.map(({ name, label, href, description }) => (
          <article key={name}>
            <span className="eyebrow">{label}</span>
            <h3>
              <a href={href} target="_blank" rel="noreferrer">
                {name} ↗
              </a>
            </h3>
            <p>{description}</p>
          </article>
        ))}
      </div>
    </>
  );
}

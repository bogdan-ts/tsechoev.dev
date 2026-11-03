import { profile } from "../../lib/profile";

export function AboutCommand() {
  return (
    <>
      <p className="eyebrow">ABOUT ME</p>
      <h2 className="name">{profile.name}</h2>
      <p className="role">{profile.role}</p>
      <p className="prose">{profile.summary}</p>
      <p className="muted">
        {profile.location} <span className="separator">/</span> {profile.timezone}
      </p>
      <div className="metrics">
        {profile.highlights.map(({ value, label }) => (
          <div key={label}>
            <strong>{value}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

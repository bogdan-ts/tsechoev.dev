import { profile } from "../../lib/profile";

export function SkillsCommand() {
  return (
    <>
      <h2>Skills</h2>
      <div className="skill-groups">
        {profile.skills.map(({ title, items }) => (
          <div key={title}>
            <h3>{title}</h3>
            <p>{items.join(" · ")}</p>
          </div>
        ))}
      </div>
    </>
  );
}

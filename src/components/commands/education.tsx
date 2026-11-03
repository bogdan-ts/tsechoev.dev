import { profile } from "../../lib/profile";

export function EducationCommand() {
  return (
    <>
      <h2>Education</h2>
      {profile.education.map(({ school, degree, period }) => (
        <article className="education" key={degree}>
          <p className="eyebrow">{period}</p>
          <h3>{degree}</h3>
          <p>{school} · Vladivostok, Russia</p>
        </article>
      ))}
    </>
  );
}

import { profile } from "../../lib/profile";

export function ContactCommand() {
  return (
    <>
      <h2>Contact</h2>
      <p className="muted">{profile.location}. {profile.timezone}.</p>
      <div className="contact-links">
        {profile.links.map(({ label, href, text }) => (
          <a href={href} key={label}>
            <span>{label}</span>
            {text}
            <span aria-hidden="true">↗</span>
          </a>
        ))}
      </div>
    </>
  );
}

import type { CommandActionProps } from "../command-list";
import { profile } from "../../lib/profile";

export function ContactCommand({ compact = false }: CommandActionProps & { compact?: boolean }) {
  return (
    <>
      {!compact && <h2>Contact</h2>}
      {!compact && (
        <p className="muted">
          {profile.location}. {profile.timezone}.
        </p>
      )}
      <div className={compact ? "profile-contact-links" : "contact-links"}>
        {profile.links.map(({ label, href, text }) => (
          <a href={href} key={label}>
            {compact ? (
              label
            ) : (
              <>
                <span>{label}</span>
                {text}
                <span aria-hidden="true">↗</span>
              </>
            )}
          </a>
        ))}
      </div>
    </>
  );
}

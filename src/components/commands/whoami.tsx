import type { CommandActionProps } from "../command-list";
import { AboutCommand } from "./about";
import { ExperienceCommand } from "./experience";
import { SkillsCommand } from "./skills";
import { OpenSourceCommand } from "./opensource";
import { EducationCommand } from "./education";
import { ContactDetails } from "../contact-details";
import { ContactCommand } from "./contact";
import { CvCommand } from "./cv";

export function WhoamiCommand({
  contactAtTop = false,
}: CommandActionProps & { contactAtTop?: boolean }) {
  return (
    <div className="full-profile">
      <section aria-label="About">
        <AboutCommand />
      </section>
      {contactAtTop && (
        <section className="profile-contact" aria-label="Contact">
          <ContactDetails />
        </section>
      )}
      <section aria-label="Experience">
        <ExperienceCommand />
      </section>
      <section aria-label="Skills">
        <SkillsCommand />
      </section>
      <section aria-label="Open source">
        <OpenSourceCommand />
      </section>
      <section aria-label="Education">
        <EducationCommand />
      </section>
      {!contactAtTop && (
        <section aria-label="Contact">
          <ContactCommand />
        </section>
      )}
      <section aria-label="CV">
        <CvCommand />
      </section>
    </div>
  );
}

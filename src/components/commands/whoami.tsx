import { AboutCommand } from "./about";
import { ExperienceCommand } from "./experience";
import { SkillsCommand } from "./skills";
import { OpenSourceCommand } from "./opensource";
import { EducationCommand } from "./education";
import { ContactCommand } from "./contact";
import { CvCommand } from "./cv";

export function WhoamiCommand() {
  return (
    <div className="full-profile">
      <section aria-label="About"><AboutCommand /></section>
      <section aria-label="Experience"><ExperienceCommand /></section>
      <section aria-label="Skills"><SkillsCommand /></section>
      <section aria-label="Open source"><OpenSourceCommand /></section>
      <section aria-label="Education"><EducationCommand /></section>
      <section aria-label="Contact"><ContactCommand /></section>
      <section aria-label="CV"><CvCommand /></section>
    </div>
  );
}

import type { ExperienceRole, ResumeProfile } from "./profile";

const escapeHtml = (value: string): string =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const renderList = (items: string[]): string =>
  `<ul>${items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;

const renderExperience = (role: ExperienceRole): string => `
  <article class="experience-item">
    <header>
      <h3>${escapeHtml(role.title)}</h3>
      <p class="meta">${escapeHtml(role.company)} · ${escapeHtml(role.period)} · ${escapeHtml(role.location)}</p>
    </header>
    ${renderList(role.bullets)}
    ${role.stack ? `<p class="stack">stack: ${role.stack.map(escapeHtml).join(", ")}</p>` : ""}
  </article>
`;

export const renderProfile = (profile: ResumeProfile): string => `
  <main class="terminal-page">
    <section class="hero" aria-labelledby="hero-title">
      <p class="prompt">$ whoami</p>
      <h1 id="hero-title">${escapeHtml(profile.name)}</h1>
      <p class="role">${escapeHtml(profile.role)}</p>
      <p class="location">${escapeHtml(profile.location)}</p>
      <p class="summary">${escapeHtml(profile.summary)}</p>
    </section>

    <section aria-labelledby="skills-title">
      <h2 id="skills-title">skills</h2>
      ${profile.skills
        .map(
          (group) => `
            <section class="skill-group" aria-label="${escapeHtml(group.title)} skills">
              <h3>${escapeHtml(group.title)}</h3>
              ${renderList(group.items)}
            </section>
          `
        )
        .join("")}
    </section>

    <section aria-labelledby="experience-title">
      <h2 id="experience-title">experience</h2>
      ${profile.experience.map(renderExperience).join("")}
    </section>

    <section aria-labelledby="education-title">
      <h2 id="education-title">education</h2>
      <ul>
        ${profile.education
          .map(
            (item) => `
              <li>
                <strong>${escapeHtml(item.school)}</strong>
                <span>${escapeHtml(item.degree)} · ${escapeHtml(item.period)}</span>
              </li>
            `
          )
          .join("")}
      </ul>
    </section>

    <section aria-labelledby="projects-title">
      <h2 id="projects-title">projects</h2>
      <ul>
        ${profile.projects
          .map(
            (project) => `
              <li>
                <strong>${escapeHtml(project.name)}</strong>
                <span>${escapeHtml(project.description)}</span>
              </li>
            `
          )
          .join("")}
      </ul>
    </section>

    <section aria-labelledby="contact-title">
      <h2 id="contact-title">contact</h2>
      <ul>
        ${profile.links
          .map((link) => `<li><a href="${escapeHtml(link.href)}">${escapeHtml(link.label)}</a></li>`)
          .join("")}
        <li><a href="${escapeHtml(profile.resumeHref)}">resume</a></li>
      </ul>
    </section>
  </main>
`;

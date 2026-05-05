<svelte:options runes={true} />

<script lang="ts">
  import { profile } from "./profile";
</script>

<main class="terminal-page">
  <section class="hero" aria-labelledby="hero-title">
    <p class="prompt">$ whoami</p>
    <h1 id="hero-title">{profile.name}</h1>
    <p class="role">{profile.role}</p>
    <p class="location">{profile.phone} · <a href={`mailto:${profile.email}`}>{profile.email}</a> · {profile.location}</p>
    <p class="summary">{profile.summary}</p>
  </section>

  <section aria-labelledby="skills-title">
    <h2 id="skills-title">skills</h2>
    <div class="skills-grid">
      {#each profile.skills as group}
        <section class="skill-group" aria-label={`${group.title} skills`}>
          <h3>{group.title}</h3>
          <ul class="skills-list">
            {#each group.items as item}
              <li>{item}</li>
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </section>

  <section aria-labelledby="experience-title">
    <h2 id="experience-title">experience</h2>
    {#each profile.experience as role}
      <article class="experience-item">
        <header>
          <h3>{role.title}</h3>
          <p class="meta">{role.company} · {role.period} · {role.location}</p>
        </header>
        <ul>
          {#each role.bullets as bullet}
            <li>{bullet}</li>
          {/each}
        </ul>
        {#if role.stack}
          <p class="stack">stack: {role.stack.join(", ")}</p>
        {/if}
      </article>
    {/each}
  </section>

  <section aria-labelledby="education-title">
    <h2 id="education-title">education</h2>
    <ul>
      {#each profile.education as item}
        <li>
          <strong>{item.school}</strong>
          <span>{item.degree} · {item.period}</span>
        </li>
      {/each}
    </ul>
  </section>

  <section aria-labelledby="languages-title">
    <h2 id="languages-title">languages</h2>
    <ul>
      {#each profile.languages as language}
        <li>{language}</li>
      {/each}
    </ul>
  </section>

  <section aria-labelledby="contact-title">
    <h2 id="contact-title">contact</h2>
    <ul>
      {#each profile.links as link}
        <li><a href={link.href}>{link.label}</a></li>
      {/each}
      <li><a href={profile.resumeHref}>resume</a></li>
    </ul>
  </section>
</main>

<script lang="ts">
  import type { ExperienceRole } from "../profile";

  type Props = {
    role: ExperienceRole;
  };

  let { role }: Props = $props();
</script>

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

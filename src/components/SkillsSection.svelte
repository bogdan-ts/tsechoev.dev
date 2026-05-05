<script lang="ts">
  import type { SkillGroup } from "../profile";
  import SectionTitle from "./SectionTitle.svelte";

  type Props = {
    skills: SkillGroup[];
  };

  let { skills }: Props = $props();
</script>

<section aria-labelledby="skills-title">
  <SectionTitle title="skills" titleId="skills-title" />
  <div class="skills-grid">
    {#each skills as group}
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

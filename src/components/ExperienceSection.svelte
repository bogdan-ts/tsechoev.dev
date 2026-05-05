<script lang="ts">
  import type { ExperienceRole } from "../profile";
  import ExperienceItem from "./ExperienceItem.svelte";
  import SectionTitle from "./SectionTitle.svelte";

  type Props = {
    experience: ExperienceRole[];
  };

  let { experience }: Props = $props();
</script>

<section aria-labelledby="experience-title">
  <SectionTitle title="experience" titleId="experience-title" />
  {#each experience as role}
    <ExperienceItem {role} />
  {/each}
</section>

<script lang="ts">
  import type { Education } from "../profile";
  import SectionTitle from "./SectionTitle.svelte";

  type Props = {
    education: Education[];
  };

  let { education }: Props = $props();
</script>

<section aria-labelledby="education-title">
  <SectionTitle title="education" titleId="education-title" />
  <ul>
    {#each education as item}
      <li>
        <strong>{item.school}</strong>
        <span>{item.degree} · {item.period}</span>
      </li>
    {/each}
  </ul>
</section>

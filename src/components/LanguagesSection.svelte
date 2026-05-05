<script lang="ts">
  import SectionTitle from "./SectionTitle.svelte";

  type Props = {
    languages: string[];
  };

  let { languages }: Props = $props();
</script>

<section aria-labelledby="languages-title">
  <SectionTitle title="languages" titleId="languages-title" />
  <ul>
    {#each languages as language}
      <li>{language}</li>
    {/each}
  </ul>
</section>

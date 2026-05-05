<script lang="ts">
  import type { ProfileLink } from "../profile";
  import SectionTitle from "./SectionTitle.svelte";

  type Props = {
    links: ProfileLink[];
    resumeHref: string;
  };

  let { links, resumeHref }: Props = $props();
</script>

<section aria-labelledby="contact-title">
  <SectionTitle title="contact" titleId="contact-title" />
  <ul>
    {#each links as link}
      <li><a href={link.href}>{link.label}</a></li>
    {/each}
    <li><a href={resumeHref}>resume</a></li>
  </ul>
</section>

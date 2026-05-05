<script lang="ts">
  import type { ResumeProfile } from "../profile";

  type Props = {
    profile: ResumeProfile;
  };

  let { profile }: Props = $props();
</script>

<section class="hero" aria-labelledby="hero-title">
  <p class="prompt">$ whoami</p>
  <h1 id="hero-title">{profile.name}</h1>
  <p class="role">{profile.role}</p>
  <p class="location">{profile.location}</p>
  {#each profile.summary.split("\n\n") as paragraph}
    <p class="summary">{paragraph}</p>
  {/each}
</section>

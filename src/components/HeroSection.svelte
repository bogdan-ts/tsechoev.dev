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
  <p class="location">{profile.phone} · <a href={`mailto:${profile.email}`}>{profile.email}</a> · {profile.location}</p>
  <p class="summary">{profile.summary}</p>
</section>

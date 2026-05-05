<svelte:options runes={true} />

<script lang="ts">
  import ContactSection from "./components/ContactSection.svelte";
  import EducationSection from "./components/EducationSection.svelte";
  import ExperienceSection from "./components/ExperienceSection.svelte";
  import HeroSection from "./components/HeroSection.svelte";
  import LanguagesSection from "./components/LanguagesSection.svelte";
  import SkillsSection from "./components/SkillsSection.svelte";
  import { profile } from "./profile";
</script>

<main class="terminal-page">
  <HeroSection {profile} />
  <SkillsSection skills={profile.skills} />
  <ExperienceSection experience={profile.experience} />
  <EducationSection education={profile.education} />
  <LanguagesSection languages={profile.languages} />
  <ContactSection links={profile.links} resumeHref={profile.resumeHref} />
</main>

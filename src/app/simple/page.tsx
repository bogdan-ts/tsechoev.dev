import type { Metadata } from "next";
import { WhoamiCommand } from "../../components/commands/whoami";
import { SimpleNavigation } from "../../components/simple-navigation";

export const metadata: Metadata = {
  title: "Bogdan Tsechoev | Profile",
  alternates: { canonical: "https://tsechoev.dev/simple/" },
};

export default function SimplePage() {
  return (
    <>
      <SimpleNavigation section="whoami" />
      <section id="whoami" aria-labelledby="profile-heading">
        <h1 id="profile-heading">Whoami</h1>
        <WhoamiCommand />
      </section>
    </>
  );
}

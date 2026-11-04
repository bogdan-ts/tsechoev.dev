import { siteMetadata } from "../../lib/site-metadata";
import { WhoamiCommand } from "../../components/commands/whoami";
import { SimpleNavigation } from "../../components/simple-navigation";

export const metadata = siteMetadata("Bogdan Tsechoev | Profile", "/simple/");

export default function SimplePage() {
  return (
    <>
      <SimpleNavigation section="whoami" />
      <section id="whoami" aria-labelledby="profile-heading">
        <h1 id="profile-heading">Bogdan Tsechoev</h1>
        <WhoamiCommand />
      </section>
    </>
  );
}

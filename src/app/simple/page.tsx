import type { Metadata } from "next";
import { SiteHeader } from "../../components/site-header";
import { WhoamiCommand } from "../../components/commands/whoami";
import { TravelCommand } from "../../components/commands/travel";
import { TravelGlobe } from "../../components/commands/globe";

export const metadata: Metadata = {
  title: "Bogdan Tsechoev | Profile & travel",
  alternates: { canonical: "https://tsechoev.dev/simple/" },
};

export default function SimplePage() {
  return (
    <div className="site-shell">
      <SiteHeader version="simple" />
      <main className="simple-page workspace">
        <div className="simple-content command-output">
          <nav className="section-nav" aria-label="Profile sections">
            <a href="#whoami">Whoami</a>
            <a href="#travel">Travel</a>
          </nav>
          <section id="whoami" aria-labelledby="profile-heading">
            <h1 id="profile-heading">Whoami</h1>
            <WhoamiCommand />
          </section>
          <section id="travel" aria-label="Travel">
            <TravelCommand />
            <details className="travel-globe-details">
              <summary>View globe</summary>
              <TravelGlobe />
            </details>
          </section>
        </div>
      </main>
    </div>
  );
}

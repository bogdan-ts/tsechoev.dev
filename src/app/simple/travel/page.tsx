import { siteMetadata } from "../../../lib/site-metadata";
import { SimpleNavigation } from "../../../components/simple-navigation";
import { GlobeView } from "../../../components/globe-view";
import { countries } from "../../../lib/profile";

export const metadata = siteMetadata("Travel | Bogdan Tsechoev", "/simple/travel/");

export default function TravelPage() {
  return (
    <>
      <SimpleNavigation section="travel" />
      <section id="travel" aria-labelledby="travel-heading">
        <h1 id="travel-heading">Travel</h1>
        <GlobeView />
        <ul>
          {countries.map(({ code, name }) => (
            <li key={code}>{name}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

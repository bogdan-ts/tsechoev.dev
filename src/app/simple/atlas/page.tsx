import { siteMetadata } from "../../../lib/site-metadata";
import { SimpleNavigation } from "../../../components/simple-navigation";
import { GlobeView } from "../../../components/globe-view";
import { countries } from "../../../lib/profile";

const description = `I’ve visited ${countries.length} countries and territories so far. You can explore them on the globe or browse the list below.`;

export const metadata = siteMetadata("Atlas | Bogdan Tsechoev", "/simple/atlas/", description);

export default function AtlasPage() {
  return (
    <>
      <SimpleNavigation section="atlas" />
      <section id="atlas" aria-labelledby="atlas-heading">
        <h1 id="atlas-heading">Atlas</h1>
        <p className="prose muted">{description}</p>
        <GlobeView showHeading={false} />
        <ul>
          {countries.map(({ code, name }) => (
            <li key={code}>{name}</li>
          ))}
        </ul>
      </section>
    </>
  );
}

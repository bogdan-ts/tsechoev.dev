import type { Metadata } from "next";
import { SimpleNavigation } from "../../../components/simple-navigation";
import { GlobeDisclosure } from "../../../components/lazy-globe";
import { countries } from "../../../lib/profile";

export const metadata: Metadata = {
  title: "Travel | Bogdan Tsechoev",
  alternates: { canonical: "https://tsechoev.dev/simple/travel/" },
};

export default function TravelPage() {
  return (
    <>
      <SimpleNavigation section="travel" />
      <section id="travel" aria-labelledby="travel-heading">
        <h1 id="travel-heading">Travel</h1>
        <ul>
          {countries.map(({ code, name }) => <li key={code}>{name}</li>)}
        </ul>
        <GlobeDisclosure />
      </section>
    </>
  );
}

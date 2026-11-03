import { countries } from "../../lib/profile";
import type { CommandActionProps } from "../command-list";
import { TravelGlobe } from "./globe";

type TravelCommandProps = CommandActionProps & { view?: "globe" };

export function TravelCommand({ view, onCommand }: TravelCommandProps) {
  if (view === "globe") return <TravelGlobe onCommand={onCommand} />;
  return (
    <>
      <h2>Travel</h2>
      <ul>
        {countries.map(({ code, name }) => <li key={code}>{name}</li>)}
      </ul>
    </>
  );
}

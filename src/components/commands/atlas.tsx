import { countries } from "../../lib/profile";
import type { CommandActionProps } from "../command-list";
import { GlobeView } from "../globe-view";

type AtlasCommandProps = CommandActionProps & { view?: "globe" };

export function AtlasCommand({ view, onCommand }: AtlasCommandProps) {
  if (view === "globe") return <GlobeView onCommand={onCommand} />;
  return (
    <>
      <h2>Atlas</h2>
      <ul>
        {countries.map(({ code, name }) => (
          <li key={code}>{name}</li>
        ))}
      </ul>
    </>
  );
}

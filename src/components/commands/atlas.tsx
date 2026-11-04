import { countries } from "../../lib/profile";
import type { CommandActionProps } from "../command-list";
import { GlobeView } from "../globe-view";

type AtlasCommandProps = CommandActionProps & { view?: "globe" };

export function AtlasCommand({ view, onCommand }: AtlasCommandProps) {
  if (view === "globe") return <GlobeView onCommand={onCommand} />;
  return (
    <>
      <h2>Atlas</h2>
      <p className="muted">{countries.length} countries and territories visited.</p>
      <ul className="atlas-places" aria-label="Visited countries and territories">
        {countries.map(({ code, name }) => (
          <li key={code}>{name}</li>
        ))}
      </ul>
      <p className="atlas-globe-link">
        {onCommand ? (
          <button type="button" onClick={() => onCommand("atlas --globe")}>
            atlas --globe
          </button>
        ) : (
          <code>atlas --globe</code>
        )}
        <span className="muted"> — explore on the globe</span>
      </p>
    </>
  );
}

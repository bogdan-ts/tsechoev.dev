import { TravelGlobe } from "./commands/globe";
import { GlobeBoundary } from "./globe-boundary";
import type { TravelGlobeProps } from "./commands/globe";

export function GlobeView(props: TravelGlobeProps) {
  return (
    <GlobeBoundary>
      <TravelGlobe {...props} />
    </GlobeBoundary>
  );
}

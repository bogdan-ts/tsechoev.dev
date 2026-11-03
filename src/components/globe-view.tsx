import { TravelGlobe } from "./commands/globe";
import { GlobeBoundary } from "./globe-boundary";
import type { CommandActionProps } from "./command-list";

export function GlobeView(props: CommandActionProps) {
  return (
    <GlobeBoundary>
      <TravelGlobe {...props} />
    </GlobeBoundary>
  );
}

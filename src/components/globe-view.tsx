import { AtlasGlobe } from "./commands/globe";
import { GlobeBoundary } from "./globe-boundary";
import type { AtlasGlobeProps } from "./commands/globe";

export function GlobeView(props: AtlasGlobeProps) {
  return (
    <GlobeBoundary>
      <AtlasGlobe {...props} />
    </GlobeBoundary>
  );
}

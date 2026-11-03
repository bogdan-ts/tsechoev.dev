"use client";

import dynamic from "next/dynamic";
import { GlobeBoundary } from "./globe-boundary";
import type { CommandActionProps } from "./command-list";

const Globe = dynamic(() => import("./commands/globe").then((module) => module.TravelGlobe), {
  ssr: false,
  loading: () => (
    <div className="globe-loading" role="status">
      Loading globe…
    </div>
  ),
});

export function LazyGlobe(props: CommandActionProps) {
  return (
    <GlobeBoundary>
      <Globe {...props} />
    </GlobeBoundary>
  );
}

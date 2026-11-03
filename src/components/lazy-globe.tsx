"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

export const LazyGlobe = dynamic(
  () => import("./commands/globe").then(module => module.TravelGlobe),
  { ssr: false, loading: () => <div className="globe-loading" role="status">Loading globe…</div> },
);

export function GlobeDisclosure() {
  const [opened, setOpened] = useState(false);
  return (
    <details className="travel-globe-details" onToggle={event => setOpened(event.currentTarget.open)}>
      <summary>View globe</summary>
      {opened && <LazyGlobe />}
    </details>
  );
}

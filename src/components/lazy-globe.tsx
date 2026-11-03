"use client";

import dynamic from "next/dynamic";

export const LazyGlobe = dynamic(
  () => import("./commands/globe").then(module => module.TravelGlobe),
  { ssr: false, loading: () => <div className="globe-loading" role="status">Loading globe…</div> },
);

import { SITE_URL } from "../lib/site-metadata";
import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/simple/`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/simple/atlas/`, changeFrequency: "monthly", priority: 0.5 },
  ];
}

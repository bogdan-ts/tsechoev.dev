import type { MetadataRoute } from "next";
export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://tsechoev.dev", changeFrequency: "monthly", priority: 1 },
    { url: "https://tsechoev.dev/simple/", changeFrequency: "monthly", priority: 0.9 },
    { url: "https://tsechoev.dev/simple/travel/", changeFrequency: "monthly", priority: 0.5 },
  ];
}

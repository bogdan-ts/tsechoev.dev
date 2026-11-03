import type { Metadata } from "next";

export const SITE_URL = "https://tsechoev.dev";
export const SITE_TITLE = "Bogdan Tsechoev | Senior Full-Stack Engineer";
const description =
  "Full-stack engineer with 7+ years in SaaS, AI, e-commerce and mobile apps. Work experience, technical skills, open-source contributions and CV.";

export function siteMetadata(title = SITE_TITLE, path = "/"): Metadata {
  const url = new URL(path, SITE_URL).href;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      images: [
        {
          url: `${SITE_URL}/og.png`,
          width: 1200,
          height: 630,
          alt: "Bogdan Tsechoev, Senior Full-Stack Engineer",
        },
      ],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

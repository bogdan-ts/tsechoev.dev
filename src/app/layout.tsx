import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const martianMono = localFont({
  src: [
    { path: "../../node_modules/@fontsource/martian-mono/files/martian-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "../../node_modules/@fontsource/martian-mono/files/martian-mono-latin-500-normal.woff2", weight: "500", style: "normal" },
    { path: "../../node_modules/@fontsource/martian-mono/files/martian-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-martian-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://tsechoev.dev"),
  title: "Bogdan Tsechoev — Senior Full-Stack Engineer",
  description: "7+ years building SaaS, AI, e-commerce, and mobile products. Explore my experience, open-source contributions, and skills through an interactive terminal.",
  alternates: { canonical: "/" },
  icons: { icon: "/favicon.svg" },
  openGraph: { title: "Bogdan Tsechoev — beyond the prompt", description: "Senior Full-Stack Engineer. Products, PostgreSQL, and a little curiosity. Explore my interactive portfolio.", url: "/", type: "website", images: [{ url: "/og.png", width: 1200, height: 630, alt: "Bogdan Tsechoev — Senior Full-Stack Engineer" }] },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#141614", colorScheme: "dark light" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={martianMono.variable}><body>{children}</body></html>;
}

import Link from "next/link";
import { siteMetadata } from "../../../lib/site-metadata";

export const metadata = {
  ...siteMetadata("Atlas | Bogdan Tsechoev", "/simple/atlas/"),
  robots: { index: false, follow: true },
};

export default function AtlasRedirectPage() {
  return (
    <>
      <meta httpEquiv="refresh" content="0;url=/simple/atlas/" />
      <p>
        This page has moved to <Link href="/simple/atlas/">Atlas</Link>.
      </p>
    </>
  );
}

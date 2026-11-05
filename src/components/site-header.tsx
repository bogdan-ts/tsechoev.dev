import { SiteTitle } from "./site-title";
import { ThemeToggle } from "./theme-toggle";
import Link from "next/link";

export function SiteHeader({ version }: { version: "terminal" | "simple" }) {
  return (
    <header className="site-header">
      <SiteTitle />
      <nav aria-label="Site version">
        <Link href="/" aria-current={version === "terminal" ? "page" : undefined}>
          Terminal
        </Link>
        <Link href="/simple/" aria-current={version === "simple" ? "page" : undefined}>
          Simple
        </Link>
        <ThemeToggle />
      </nav>
    </header>
  );
}

import Link from "next/link";

export function SiteHeader({ version }: { version: "terminal" | "simple" }) {
  return (
    <header className="site-header">
      <span className="site-title">tsechoev.dev</span>
      <nav aria-label="Site version">
        <Link href="/" aria-current={version === "terminal" ? "page" : undefined}>
          Terminal
        </Link>
        <Link href="/simple/" aria-current={version === "simple" ? "page" : undefined}>
          Simple
        </Link>
      </nav>
    </header>
  );
}

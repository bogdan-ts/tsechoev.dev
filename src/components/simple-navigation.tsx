import Link from "next/link";

export function SimpleNavigation({ section }: { section: "whoami" | "atlas" | "sql-detective" }) {
  return (
    <nav className="section-nav" aria-label="Profile sections">
      <Link href="/simple/" aria-current={section === "whoami" ? "page" : undefined}>
        Whoami
      </Link>
      <Link href="/simple/atlas/" aria-current={section === "atlas" ? "page" : undefined}>
        Atlas
      </Link>
      <Link
        href="/simple/sql-detective/"
        prefetch={false}
        aria-current={section === "sql-detective" ? "page" : undefined}
      >
        SQL Detective
      </Link>
    </nav>
  );
}

import Link from "next/link";

export function SimpleNavigation({ section }: { section: "whoami" | "atlas" }) {
  return (
    <nav className="section-nav" aria-label="Profile sections">
      <Link href="/simple/" aria-current={section === "whoami" ? "page" : undefined}>
        Who I Am
      </Link>
      <Link href="/simple/atlas/" aria-current={section === "atlas" ? "page" : undefined}>
        Atlas
      </Link>
    </nav>
  );
}

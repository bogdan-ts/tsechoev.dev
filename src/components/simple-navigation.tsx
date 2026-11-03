import Link from "next/link";

export function SimpleNavigation({ section }: { section: "whoami" | "travel" }) {
  return (
    <nav className="section-nav" aria-label="Profile sections">
      <Link href="/simple/" aria-current={section === "whoami" ? "page" : undefined}>Whoami</Link>
      <Link href="/simple/travel/" aria-current={section === "travel" ? "page" : undefined}>Travel</Link>
    </nav>
  );
}

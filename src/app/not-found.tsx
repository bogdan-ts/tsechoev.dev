import Link from "next/link";

export default function NotFound() {
  return (
    <main className="workspace">
      <div className="not-found">
        <h1>404: Page not found</h1>
        <Link href="/">cd ~ → Back to the terminal</Link>
      </div>
    </main>
  );
}

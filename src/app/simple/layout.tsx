import type { ReactNode } from "react";
import { SiteHeader } from "../../components/site-header";

export default function SimpleLayout({ children }: { children: ReactNode }) {
  return (
    <div className="site-shell simple-shell">
      <SiteHeader version="simple" />
      <main className="simple-page workspace">
        <div className="simple-content command-output">{children}</div>
      </main>
    </div>
  );
}

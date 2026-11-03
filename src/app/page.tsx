import { Terminal } from "../components/terminal";
import { SiteHeader } from "../components/site-header";

export default function Page() {
  return (
    <div className="site-shell">
      <SiteHeader version="terminal" />
      <div className="site-content"><Terminal /></div>
    </div>
  );
}

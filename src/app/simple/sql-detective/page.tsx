import Link from "next/link";
import { SimpleNavigation } from "../../../components/simple-navigation";
import { SqlDetectiveLab } from "../../../components/sql-detective/lab";
import { siteMetadata } from "../../../lib/site-metadata";
export const metadata = siteMetadata(
  "SQL Detective | Bogdan Tsechoev",
  "/simple/sql-detective/",
  "Investigate a slow orders query with real PostgreSQL in your browser.",
);
export default function SqlDetectivePage() {
  return (
    <>
      <SimpleNavigation section="sql-detective" />
      <div className="detective-case-header">
        <span className="detective-kicker">SQL DETECTIVE / CASE FILE 001</span>
        <h1>Case 001: The slow orders page</h1>
        <p>
          A customer opens their order history. The page only needs the latest 20 orders, but the
          query does far more work than expected. Find out why and improve its plan.
        </p>
        <p>Real PostgreSQL. Runs in your browser.</p>
        <p>
          <Link href="/">Back to terminal</Link>
        </p>
      </div>
      <SqlDetectiveLab />
      <noscript>
        Enable JavaScript to start the local database. Navigation and the case description remain
        available.
      </noscript>
    </>
  );
}

import { PGlite } from "@electric-sql/pglite";
import {
  CASE_VERSION,
  configurations,
  explain,
  profiles,
  query,
  schema,
  seed,
  type Configuration,
  type Profile,
} from "./case-orders";
import { medianPlan, normalizeRows, sameRows } from "./plan-analysis";
import type { Experiment, IndexInfo, Plan, Session } from "./types";
export class InvestigationDatabase {
  private configuration: Configuration = "none";
  private baseline: Experiment | undefined;
  private sequence = 0;
  constructor(
    private db: PGlite,
    readonly session: Session,
  ) {}
  static async initialize(profile: Profile, progress: (stage: string) => void) {
    const started = performance.now();
    progress("Loading engine");
    const db = await PGlite.create();
    try {
      progress("Creating table");
      await db.exec(schema);
      progress("Generating data");
      await db.exec(seed(profile));
      progress("Collecting statistics");
      await db.exec("analyze orders;");
      const counts = await db.query<{ rows: number; matching: number }>(
        "select count(*)::int as rows, count(*) filter (where customer_id = 42)::int as matching from orders;",
      );
      const count = counts.rows[0];
      if (count.rows !== profiles[profile] || count.matching !== profiles[profile] / 20)
        throw new Error("Dataset verification failed");
      const version = await db.query<{ version: string }>("select version();");
      return new InvestigationDatabase(db, {
        id: `${CASE_VERSION}:${profile}:${profiles[profile]}:${crypto.randomUUID()}`,
        profile,
        ...count,
        version: version.rows[0].version,
        preparationMs: performance.now() - started,
      });
    } catch (error) {
      await db.close();
      throw error;
    }
  }
  async indexes() {
    return (
      await this.db.query<IndexInfo>(
        "select indexname, indexdef, pg_relation_size(indexname::regclass)::int as bytes from pg_indexes where schemaname = 'public' and tablename = 'orders' order by indexname;",
      )
    ).rows;
  }
  async apply(configuration: Configuration) {
    await this.db.transaction(async (tx) => {
      for (const item of Object.values(configurations))
        if (item.name) await tx.exec(`drop index if exists ${item.name};`);
      if (configurations[configuration].ddl) await tx.exec(configurations[configuration].ddl);
    });
    const indexes = await this.indexes();
    const additional = indexes.filter((i) => i.indexname !== "orders_pkey");
    if (
      additional.length !== (configuration === "none" ? 0 : 1) ||
      additional.some((i) => i.indexname !== configurations[configuration].name)
    )
      throw new Error("Index catalog mismatch");
    this.configuration = configuration;
    return indexes;
  }
  async run(): Promise<Experiment> {
    if (!this.baseline && this.configuration !== "none")
      throw new Error("Run the baseline without additional indexes first");
    const measure = async () => {
      const result = await this.db.query<{ "QUERY PLAN": Plan[] }>(explain);
      const plan = result.rows[0]?.["QUERY PLAN"]?.[0];
      if (!plan?.Plan || typeof plan["Execution Time"] !== "number")
        throw new Error("Invalid EXPLAIN JSON");
      return plan;
    };
    await measure();
    const samples: Plan[] = [];
    for (let i = 0; i < 3; i++) samples.push(await measure());
    const rows = normalizeRows((await this.db.query<Record<string, unknown>>(query)).rows);
    const experiment: Experiment = {
      id: `${this.session.id}:${++this.sequence}`,
      session: this.session,
      configuration: this.configuration,
      indexes: await this.indexes(),
      samples,
      median: medianPlan(samples),
      rows,
      matches: this.baseline ? sameRows(this.baseline.rows, rows) : null,
    };
    if (!this.baseline) this.baseline = experiment;
    return experiment;
  }
  async close() {
    await this.db.close();
  }
}

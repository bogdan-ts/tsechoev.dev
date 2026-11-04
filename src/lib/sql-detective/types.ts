import type { Configuration, Profile } from "./case-orders";
export type PlanNode = { "Node Type": string; Plans?: PlanNode[]; [key: string]: unknown };
export type Plan = {
  Plan: PlanNode;
  "Execution Time"?: number;
  "Planning Time"?: number;
  [key: string]: unknown;
};
export type Order = {
  id: number;
  customer_id: number;
  created_at: string;
  status: string;
  total_cents: number;
};
export type IndexInfo = { indexname: string; indexdef: string; bytes: number };
export type Session = {
  id: string;
  profile: Profile;
  rows: number;
  matching: number;
  version: string;
  preparationMs: number;
};
export type Experiment = {
  id: string;
  session: Session;
  configuration: Configuration;
  indexes: IndexInfo[];
  samples: Plan[];
  median: Plan;
  rows: Order[];
  matches: boolean | null;
};
export type Command =
  | { type: "initialize"; profile: Profile }
  | { type: "apply-index"; configuration: Configuration }
  | { type: "run-experiment" }
  | { type: "dispose" };
export type Request = { requestId: number; generationId: number; command: Command };
export type Result =
  | { type: "initialized"; session: Session; indexes: IndexInfo[] }
  | { type: "applied"; configuration: Configuration; indexes: IndexInfo[] }
  | { type: "experiment"; experiment: Experiment }
  | { type: "disposed" };
export type ResponseBody =
  | { type: "progress"; stage: string }
  | { type: "result"; result: Result }
  | { type: "error"; message: string; details: string };

export type Response = { requestId: number; generationId: number } & ResponseBody;

import type { Result } from "./types";
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;
export function validResult(value: unknown): value is Result {
  if (!object(value)) return false;
  switch (value.type) {
    case "disposed":
      return true;
    case "initialized":
      return (
        object(value.session) &&
        typeof value.session.id === "string" &&
        typeof value.session.rows === "number" &&
        Array.isArray(value.indexes)
      );
    case "applied":
      return (
        ["none", "customer", "status", "latest"].includes(String(value.configuration)) &&
        Array.isArray(value.indexes)
      );
    case "experiment":
      return (
        object(value.experiment) &&
        typeof value.experiment.id === "string" &&
        object(value.experiment.session) &&
        object(value.experiment.median) &&
        object(value.experiment.median.Plan) &&
        Array.isArray(value.experiment.rows) &&
        Array.isArray(value.experiment.samples) &&
        value.experiment.samples.length === 3 &&
        Array.isArray(value.experiment.indexes)
      );
    default:
      return false;
  }
}

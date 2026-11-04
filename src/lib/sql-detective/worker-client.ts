import { validResult } from "./protocol";
import type { Command, Request, Response, Result } from "./types";
let generationSequence = 0;
export class WorkerClient {
  readonly generation = ++generationSequence;
  private sequence = 0;
  private closed = false;
  private pending:
    | {
        id: number;
        resolve: (result: Result) => void;
        reject: (error: Error) => void;
        timer: ReturnType<typeof setTimeout>;
      }
    | undefined;
  private worker: Worker;
  constructor(
    private progress: (stage: string) => void,
    factory = () =>
      new Worker(new URL("../../workers/sql-detective.worker.ts", import.meta.url), {
        type: "module",
      }),
    private onFailure?: (error: Error) => void,
  ) {
    this.worker = factory();
    this.worker.onmessage = (event: MessageEvent<Response>) => {
      const value = event.data;
      if (
        this.closed ||
        !this.pending ||
        !value ||
        value.generationId !== this.generation ||
        value.requestId !== this.pending?.id
      )
        return;
      if (value.type === "progress" && typeof value.stage === "string") {
        this.progress(value.stage);
        return;
      }
      const pending = this.pending;
      this.pending = undefined;
      clearTimeout(pending.timer);
      if (value.type === "result" && validResult(value.result)) pending.resolve(value.result);
      else
        pending.reject(
          new Error(value.type === "error" ? value.details : "Invalid worker response"),
        );
    };
    this.worker.onerror = () => this.fail(new Error("Database worker failed. Restart the case."));
    this.worker.onmessageerror = () =>
      this.fail(new Error("Could not decode the database response."));
  }
  private fail(error: Error, notify = true) {
    const pending = this.pending;
    this.pending = undefined;
    if (pending) {
      clearTimeout(pending.timer);
      pending.reject(error);
    }
    if (!this.closed) this.worker.terminate();
    this.closed = true;
    if (notify) this.onFailure?.(error);
  }
  request(command: Command): Promise<Result> {
    if (this.closed) return Promise.reject(new Error("Database session closed"));
    if (this.pending) return Promise.reject(new Error("The database is busy"));
    return new Promise((resolve, reject) => {
      const id = ++this.sequence;
      const timer = setTimeout(
        () =>
          this.fail(new Error("Database operation timed out. Retry or use the compact dataset.")),
        command.type === "initialize" ? 60000 : 20000,
      );
      this.pending = { id, resolve, reject, timer };
      try {
        this.worker.postMessage({
          requestId: id,
          generationId: this.generation,
          command,
        } satisfies Request);
      } catch (error) {
        this.fail(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }
  dispose() {
    this.fail(new Error("Database session closed"), false);
  }
}

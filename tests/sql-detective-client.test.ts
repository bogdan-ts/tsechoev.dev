import { it, expect, vi, afterEach } from "vitest";
import { WorkerClient } from "../src/lib/sql-detective/worker-client";
import type { Request, Response } from "../src/lib/sql-detective/types";
class FakeWorker {
  onmessage: ((event: MessageEvent<Response>) => void) | null = null;
  onerror: (() => void) | null = null;
  onmessageerror: (() => void) | null = null;
  sent: Request[] = [];
  terminate = vi.fn();
  postMessage(value: Request) {
    this.sent.push(value);
  }
  reply(value: unknown) {
    this.onmessage?.({ data: value } as MessageEvent<Response>);
  }
}
const setup = () => {
  const worker = new FakeWorker();
  const progress = vi.fn();
  const client = new WorkerClient(progress, () => worker as unknown as Worker);
  return { worker, client, progress };
};
afterEach(() => vi.useRealTimers());
it("ignores stale generations and request ids; accepts the current response", async () => {
  const { client, worker } = setup();
  const pending = client.request({ type: "dispose" });
  const request = worker.sent[0];
  worker.reply({
    ...request,
    generationId: request.generationId - 1,
    type: "result",
    result: { type: "disposed" },
  });
  worker.reply({
    ...request,
    requestId: request.requestId + 1,
    type: "result",
    result: { type: "disposed" },
  });
  worker.reply({ ...request, type: "result", result: { type: "disposed" } });
  await expect(pending).resolves.toEqual({ type: "disposed" });
  client.dispose();
});
it("rejects malformed RPC results rather than applying partial state", async () => {
  const { client, worker } = setup();
  const pending = client.request({ type: "initialize", profile: "compact" });
  worker.reply({ ...worker.sent[0], type: "result", result: { type: "initialized" } });
  await expect(pending).rejects.toThrow("Invalid worker response");
  client.dispose();
});
it("terminates on cancellation and watchdog timeout", async () => {
  vi.useFakeTimers();
  const { client, worker } = setup();
  const pending = client.request({ type: "run-experiment" });
  const assertion = expect(pending).rejects.toThrow("timed out");
  await vi.advanceTimersByTimeAsync(20000);
  await assertion;
  expect(worker.terminate).toHaveBeenCalled();
  const next = setup();
  const cancelled = next.client.request({ type: "initialize", profile: "compact" });
  next.client.dispose();
  await expect(cancelled).rejects.toThrow("closed");
  expect(next.worker.terminate).toHaveBeenCalled();
});

it("reports idle worker crashes and refuses requests after disposal", async () => {
  const worker = new FakeWorker(),
    failure = vi.fn();
  const client = new WorkerClient(
    () => {},
    () => worker as unknown as Worker,
    failure,
  );
  worker.onerror?.();
  expect(failure).toHaveBeenCalledTimes(1);
  await expect(client.request({ type: "run-experiment" })).rejects.toThrow("closed");
  client.dispose();
  expect(worker.terminate).toHaveBeenCalledTimes(1);
});

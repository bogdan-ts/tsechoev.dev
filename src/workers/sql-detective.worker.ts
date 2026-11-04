import { InvestigationDatabase } from "../lib/sql-detective/database";
import type { Request, Response, ResponseBody } from "../lib/sql-detective/types";
let database: InvestigationDatabase | undefined;
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent<Request>) => {
  const request = event.data;
  queue = queue.then(async () => {
    const send = (response: ResponseBody) =>
      self.postMessage({
        ...response,
        requestId: request.requestId,
        generationId: request.generationId,
      });
    try {
      const command = request.command;
      switch (command.type) {
        case "initialize":
          await database?.close();
          database = await InvestigationDatabase.initialize(command.profile, (stage) =>
            send({ type: "progress", stage }),
          );
          send({
            type: "result",
            result: {
              type: "initialized",
              session: database.session,
              indexes: await database.indexes(),
            },
          });
          break;
        case "apply-index":
          if (!database) throw new Error("Database is not ready");
          send({
            type: "result",
            result: {
              type: "applied",
              configuration: command.configuration,
              indexes: await database.apply(command.configuration),
            },
          });
          break;
        case "run-experiment":
          if (!database) throw new Error("Database is not ready");
          send({
            type: "result",
            result: { type: "experiment", experiment: await database.run() },
          });
          break;
        case "dispose":
          await database?.close();
          database = undefined;
          send({ type: "result", result: { type: "disposed" } });
          break;
      }
    } catch (error) {
      self.postMessage({
        requestId: request.requestId,
        generationId: request.generationId,
        type: "error",
        message: "The database operation failed.",
        details: error instanceof Error ? error.message : String(error),
      } satisfies Response);
    }
  });
};

import { useEffect, useRef, useState } from "react";
import { WorkerClient } from "../../lib/sql-detective/worker-client";
import type { Configuration, Profile } from "../../lib/sql-detective/case-orders";
import type { Experiment, IndexInfo, Session } from "../../lib/sql-detective/types";
export function useLab() {
  const client = useRef<WorkerClient | null>(null);
  const epoch = useRef(0);
  const [phase, setPhase] = useState("idle");
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile>("standard");
  const [configuration, setConfiguration] = useState<Configuration>("none");
  const confirmed = useRef<Configuration>("none");
  const [session, setSession] = useState<Session>();
  const [indexes, setIndexes] = useState<IndexInfo[]>([]);
  const [history, setHistory] = useState<Experiment[]>([]);
  const [selected, setSelected] = useState<Experiment>();
  useEffect(
    () => () => {
      epoch.current++;
      client.current?.dispose();
    },
    [],
  );
  const busy = ["loading", "seeding", "applying", "running", "recovering"].includes(phase);
  async function start(recover = false) {
    const generation = ++epoch.current;
    client.current?.dispose();
    setError("");
    setPhase(recover ? "recovering" : "loading");
    setStage("Loading engine");
    setHistory([]);
    setSelected(undefined);
    setSession(undefined);
    setIndexes([]);
    const restore = recover ? confirmed.current : "none";
    try {
      const next = new WorkerClient(
        (value) => {
          if (epoch.current === generation) {
            setStage(value);
            if (value !== "Loading engine") setPhase("seeding");
          }
        },
        undefined,
        (failure) => {
          if (epoch.current === generation) {
            setError(failure.message);
            setPhase("error");
          }
        },
      );
      client.current = next;
      const result = await next.request({ type: "initialize", profile });
      if (epoch.current !== generation) return;
      if (result.type !== "initialized") throw new Error("Unexpected initialization response");
      setSession(result.session);
      setIndexes(result.indexes);
      if (restore !== "none") {
        // A rebuilt session needs its own baseline before restoring the confirmed index.
        const baseline = await next.request({ type: "run-experiment" });
        if (epoch.current !== generation) return;
        if (baseline.type !== "experiment") throw new Error("Unexpected baseline response");
        setHistory([baseline.experiment]);
        setSelected(baseline.experiment);
        const applied = await next.request({ type: "apply-index", configuration: restore });
        if (epoch.current !== generation) return;
        if (applied.type !== "applied") throw new Error("Unexpected index response");
        setIndexes(applied.indexes);
      }
      confirmed.current = restore;
      setConfiguration(restore);
      setPhase("ready");
      setStage("Ready");
    } catch (e) {
      if (epoch.current === generation) {
        client.current?.dispose();
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    }
  }
  async function operate(type: "run" | "apply", choice: Configuration = configuration) {
    const generation = epoch.current;
    const next = client.current;
    if (!next || busy) return;
    setPhase(type === "run" ? "running" : "applying");
    setStage(
      type === "run"
        ? "Warm-up, three measured plans, then results"
        : "Replacing index and checking catalog",
    );
    setError("");
    try {
      const result = await next.request(
        type === "run"
          ? { type: "run-experiment" }
          : { type: "apply-index", configuration: choice },
      );
      if (epoch.current !== generation) return;
      if (type === "run" && result.type === "experiment") {
        setHistory((old) => [...old, result.experiment]);
        setSelected(result.experiment);
      } else if (type === "apply" && result.type === "applied") {
        confirmed.current = result.configuration;
        setConfiguration(result.configuration);
        setIndexes(result.indexes);
      } else throw new Error("Unexpected database response");
      setPhase("ready");
    } catch (e) {
      if (epoch.current === generation) {
        client.current?.dispose();
        setError(e instanceof Error ? e.message : String(e));
        setPhase("error");
      }
    }
  }
  return {
    phase,
    stage,
    error,
    profile,
    setProfile,
    configuration,
    session,
    indexes,
    history,
    selected,
    setSelected,
    busy,
    start,
    operate,
  };
}

"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Experiment } from "../../lib/sql-detective/types";
import { planStory } from "../../lib/sql-detective/plan-story";
const motionSnapshot = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeMotion = (notify: () => void) => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
export function ExecutionIllustration({ run }: { run: Experiment }) {
  const stages = planStory(run.median);
  const [step, setStep] = useState(0),
    [playing, setPlaying] = useState(true);
  const reduced = useSyncExternalStore(subscribeMotion, motionSnapshot, () => true);
  const [inspected, setInspected] = useState<number | null>(null);
  const shown = inspected ?? (reduced ? stages.length - 1 : step);
  const active = stages[shown];
  useEffect(() => {
    if (reduced || !playing || step >= stages.length - 1) return;
    const timer = setTimeout(() => setStep((value) => value + 1), 900);
    return () => clearTimeout(timer);
  }, [reduced, playing, step, stages.length]);
  const shownCount =
    active.count === null
      ? 0
      : Math.min(120, Math.max(1, Math.round((active.count / run.session.rows) * 120)));
  return (
    <section className="detective-story" aria-label="Plan illustration">
      <div className="detective-story-heading">
        <div>
          <span className="detective-kicker">FOLLOW THE DATA</span>
          <h3>Where does the work go?</h3>
        </div>
        <span className="detective-badge">
          {stages.some((stage) => stage.title === "Sort") ? "Sort required" : "No separate sort"}
        </span>
      </div>
      <ol className="detective-pipeline" aria-label="Execution stages">
        {stages.map((stage, i) => (
          <li key={stage.id}>
            <button
              aria-pressed={shown === i}
              onClick={() => {
                setInspected(i);
                setStep(i);
                setPlaying(false);
              }}
            >
              <span className="detective-stage-number">0{i + 1}</span>
              <strong>{stage.title}</strong>
              <span>{stage.count === null ? "Not reported" : stage.count.toLocaleString()}</span>
            </button>
          </li>
        ))}
      </ol>
      <div className="detective-workbench">
        <div
          className="detective-blocks"
          aria-hidden="true"
          data-playing={playing && !reduced && step < stages.length - 1}
        >
          {Array.from({ length: 120 }, (_, i) => (
            <span
              key={i}
              className={i < shownCount ? "is-selected" : ""}
              style={{ animationDelay: `${i * 8}ms` }}
            />
          ))}
        </div>
        <div className="detective-stage-detail">
          <span className="detective-kicker">{active.node["Node Type"]}</span>
          <strong className="detective-big-count">
            {active.count === null ? "n/a" : active.count.toLocaleString()}
          </strong>
          <span>{active.metric}</span>
          <p>{active.description}</p>
        </div>
      </div>
      <p className="small muted">
        120 cells summarize {run.session.rows.toLocaleString()} orders; a highlighted cell
        represents an aggregate, not an individual row visit. Counts use reported node rows × loops
        and may reflect rounded averages.
      </p>
      <div className="detective-story-controls">
        <button
          disabled={reduced}
          onClick={() => {
            setInspected(null);
            if (step >= stages.length - 1) {
              setStep(0);
              setPlaying(true);
            } else setPlaying(!playing);
          }}
        >
          {playing && step < stages.length - 1 ? "Pause animation" : "Play animation"}
        </button>
        <button
          disabled={reduced}
          onClick={() => {
            setInspected(null);
            setStep(0);
            setPlaying(true);
          }}
        >
          Replay
        </button>
        <button
          onClick={() => {
            setInspected(null);
            setStep(stages.length - 1);
            setPlaying(false);
          }}
        >
          Skip animation
        </button>
        <span className="small muted">Click any stage to inspect it.</span>
      </div>
      <p className="small muted">
        Illustration based on the actual query plan. Not a live execution trace.
      </p>
    </section>
  );
}

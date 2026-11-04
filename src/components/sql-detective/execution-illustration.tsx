"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import type { Experiment } from "../../lib/sql-detective/types";
import { facts } from "../../lib/sql-detective/plan-analysis";
const motionSnapshot = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const subscribeMotion = (notify: () => void) => {
  const media = matchMedia("(prefers-reduced-motion: reduce)");
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
};
export function ExecutionIllustration({ run }: { run: Experiment }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const detail = facts(run.median);
  const indexed = detail.scans.some((n) => n["Index Name"]);
  const stages = [
    indexed ? "Index → matching range" : "Table blocks → scan",
    "Matching rows",
    ...(detail.sorts.length ? ["Sort by date and id"] : []),
    "Latest 20 orders",
  ];
  const reduced = useSyncExternalStore(subscribeMotion, motionSnapshot, () => true);
  const shownStep = reduced ? stages.length - 1 : step;
  useEffect(() => {
    if (reduced || !playing || step >= stages.length - 1) return;
    const id = setTimeout(() => setStep((value) => value + 1), 850);
    return () => clearTimeout(id);
  }, [playing, step, stages.length, reduced]);
  return (
    <section aria-label="Plan illustration">
      <h3>How this plan works</h3>
      <p>Illustration based on the actual query plan. Not a live execution trace.</p>
      <div className="detective-cells" aria-hidden="true">
        {Array.from({ length: 120 }, (_, i) => (
          <span key={i} className={shownStep > 0 && i % 20 === 0 ? "accent" : ""}>
            {shownStep === 0 ? "□" : i % 20 === 0 ? "■" : "·"}
          </span>
        ))}
      </div>
      <p>
        Cells aggregate many rows; they do not identify physical row visits. Exact plan counters are
        below.
      </p>
      <ol>
        {stages.map((name, i) => (
          <li key={name}>
            <strong>
              {i <= shownStep ? "✓ " : ""}
              {name}
            </strong>
          </li>
        ))}
      </ol>
      <div className="detective-actions">
        <button disabled={reduced} onClick={() => setPlaying(!playing)}>
          {playing ? "Pause animation" : "Play animation"}
        </button>
        <button
          disabled={reduced}
          onClick={() => {
            setStep(0);
            setPlaying(true);
          }}
        >
          Replay
        </button>
        <button
          disabled={reduced}
          onClick={() => {
            setStep(stages.length - 1);
            setPlaying(false);
          }}
        >
          Skip animation
        </button>
      </div>
    </section>
  );
}

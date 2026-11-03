"use client";

import { useGlobe } from "../../hooks/use-globe";
import { renderGlobe } from "../../lib/globe";
import type { CommandActionProps } from "../command-list";

export function TravelGlobe({ onCommand }: CommandActionProps) {
  const globe = useGlobe();
  const frame = renderGlobe(globe.columns, globe.columns / 2, globe.rotation);

  return (
    <div className="globe-command" ref={globe.containerRef}>
      <h2>Travel globe</h2>
      <figure className="globe-figure">
        <pre className="globe-ascii" aria-hidden="true">
          {frame.rows.map((row, rowIndex) => (
            <span key={rowIndex}>
              {row.map((run, runIndex) => (
                <span className={`globe-${run.kind}`} key={runIndex}>{run.text}</span>
              ))}
              {rowIndex < frame.rows.length - 1 ? "\n" : null}
            </span>
          ))}
        </pre>
        <figcaption className="muted small">
          <span className="accent">Green</span>: visited countries and territories.
        </figcaption>
      </figure>
      <div className="globe-controls">
        <button type="button" onClick={globe.togglePause} disabled={globe.reducedMotion} aria-pressed={globe.paused}>
          {globe.paused ? "Resume rotation" : "Pause rotation"}
        </button>
        {onCommand && <button type="button" onClick={() => onCommand("travel")}>Show visited places</button>}
        {globe.reducedMotion && <span className="muted small">Rotation off: reduced motion.</span>}
      </div>
    </div>
  );
}

"use client";

import { useId } from "react";
import { useGlobe } from "../../hooks/use-globe";
import type { CommandActionProps } from "../command-list";

export function TravelGlobe({ onCommand }: CommandActionProps) {
  const globe = useGlobe();
  const hintId = useId();

  return (
    <div className="globe-command" ref={globe.containerRef}>
      <h2>Travel globe</h2>
      <figure className="globe-figure">
        <canvas
          className="globe-ascii"
          ref={globe.canvasRef}
          role="img"
          aria-label="Rotating ASCII globe with visited countries and territories in green"
          aria-describedby={hintId}
          tabIndex={0}
          onPointerDown={globe.pointerDown}
          onPointerMove={globe.pointerMove}
          onPointerUp={globe.pointerEnd}
          onPointerCancel={globe.pointerEnd}
          onLostPointerCapture={globe.pointerEnd}
          onKeyDown={event => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
            event.preventDefault();
            globe.rotateBy(event.key === "ArrowLeft" ? -0.12 : 0.12);
          }}
        >
          Visited countries and territories are listed by the travel command.
        </canvas>
        <figcaption className="muted small" id={hintId}>
          <span className="accent">Green</span>: visited countries and territories. Drag or use left/right arrow keys to rotate.
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

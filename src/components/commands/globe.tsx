"use client";

import { useId } from "react";
import { useGlobe } from "../../hooks/use-globe";
import type { CommandActionProps } from "../command-list";

export function TravelGlobe({ onCommand }: CommandActionProps) {
  const {
    containerRef,
    canvasRef,
    available,
    paused,
    reducedMotion,
    pointerDown,
    pointerMove,
    pointerEnd,
    rotateBy,
    togglePause,
  } = useGlobe();
  const hintId = useId();

  return (
    <div className="globe-command" ref={containerRef}>
      <h2>Travel globe</h2>
      <figure className="globe-figure">
        {available ? (
          <canvas
            className="globe-ascii"
            ref={canvasRef}
            role="img"
            aria-label="Rotating ASCII globe with visited countries and territories in green"
            aria-describedby={hintId}
            tabIndex={0}
            onPointerDown={pointerDown}
            onPointerMove={pointerMove}
            onPointerUp={pointerEnd}
            onPointerCancel={pointerEnd}
            onLostPointerCapture={pointerEnd}
            onKeyDown={(event) => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              rotateBy(event.key === "ArrowLeft" ? -0.12 : 0.12);
            }}
          >
            Visited countries and territories are listed by the travel command.
          </canvas>
        ) : (
          <p role="status">
            Canvas is unavailable in this browser. The visited places list is still available.
          </p>
        )}
        <figcaption className="muted small" id={hintId}>
          <span className="accent">Green</span>: visited countries and territories. Drag or use
          left/right arrow keys to rotate.
        </figcaption>
      </figure>
      <div className="globe-controls">
        {available && (
          <button
            type="button"
            onClick={togglePause}
            disabled={reducedMotion}
            aria-pressed={paused}
          >
            {paused ? "Resume rotation" : "Pause rotation"}
          </button>
        )}
        {onCommand && (
          <button type="button" onClick={() => onCommand("travel")}>
            Show visited places
          </button>
        )}
        {reducedMotion && <span className="muted small">Rotation off: reduced motion.</span>}
      </div>
    </div>
  );
}

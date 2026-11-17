"use client";

import { useId, useState } from "react";
import { usePortfolioAudio } from "../hooks/use-portfolio-audio";
import { introTranscript } from "../lib/audio";
import { AudioControls } from "./audio-controls";

export function IntroAudio() {
  const player = usePortfolioAudio();
  const [expanded, setExpanded] = useState(false);
  const transcriptId = useId();
  return (
    <div className="intro-audio">
      <div className="intro-audio-row">
        <AudioControls player={player} idleTrack="intro" />
        <button
          className="audio-transcript-toggle"
          type="button"
          aria-label="Read transcript"
          aria-controls={transcriptId}
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          Transcript
          <svg
            width="12"
            height="12"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d={expanded ? "m4 10 4-4 4 4" : "m4 6 4 4 4-4"} />
          </svg>
        </button>
      </div>
      <div id={transcriptId} className="audio-transcript" hidden={!expanded}>
        <p className="audio-credit muted">AI-generated voice · ElevenLabs</p>
        {introTranscript.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </div>
  );
}

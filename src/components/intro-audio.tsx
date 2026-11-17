"use client";

import { usePortfolioAudio } from "../hooks/use-portfolio-audio";
import { introTranscript } from "../lib/audio";
import { AudioControls } from "./audio-controls";

export function IntroAudio() {
  const player = usePortfolioAudio();
  return (
    <div className="intro-audio">
      {player.playback.track ? (
        <AudioControls player={player} />
      ) : (
        <button type="button" onClick={() => void player.play("intro")}>
          Listen to my intro
        </button>
      )}
      <span className="audio-credit muted">AI-generated voice · ElevenLabs</span>
      <details className="audio-transcript">
        <summary>Read transcript</summary>
        {introTranscript.split("\n\n").map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </details>
    </div>
  );
}

"use client";

import type { PortfolioAudio } from "../hooks/use-portfolio-audio";

export function AudioControls({ player }: { player: PortfolioAudio }) {
  const { playback, play, pause, stop } = player;
  if (!playback.track) return null;
  const track = playback.track;
  const label =
    playback.status === "playing"
      ? "Pause audio"
      : playback.status === "error"
        ? "Retry audio"
        : "Resume audio";
  return (
    <div className="audio-controls" role="group" aria-label="Audio player">
      <span className="muted">{track === "intro" ? "Audio intro" : "Recruiter access"}</span>
      <button
        type="button"
        disabled={playback.status === "loading"}
        onClick={() =>
          playback.status === "playing" ? pause() : void play(track, playback.status === "paused")
        }
      >
        {playback.status === "loading" ? "Loading audio…" : label}
      </button>
      <button type="button" onClick={stop}>
        Stop audio
      </button>
      {playback.status === "error" && (
        <span className="error" role="alert">
          Could not play audio. Retry or read the text instead.
        </span>
      )}
    </div>
  );
}

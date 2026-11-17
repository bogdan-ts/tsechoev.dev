"use client";

import type { PortfolioAudio } from "../hooks/use-portfolio-audio";
import type { AudioTrack } from "../lib/audio";

function PlaybackIcon({ paused }: { paused: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      {paused ? <path d="M5 3.5 12 8l-7 4.5z" /> : <path d="M4 3h3v10H4zm5 0h3v10H9z" />}
    </svg>
  );
}

export function AudioControls({
  player,
  idleTrack,
}: {
  player: PortfolioAudio;
  idleTrack?: AudioTrack;
}) {
  const { playback, play, pause, stop } = player;
  const track = playback.track ?? idleTrack;
  if (!track) return null;
  const playing = playback.status === "playing";
  const loading = playback.status === "loading";
  const label = playing
    ? "Pause audio"
    : playback.status === "error"
      ? "Retry audio"
      : playback.status === "paused"
        ? "Resume audio"
        : "Listen to my intro";
  const title = loading
    ? "Loading…"
    : playback.status === "error"
      ? "Try again"
      : track === "intro"
        ? "Listen to my intro"
        : "Recruiter access";
  return (
    <div className="audio-controls" role="group" aria-label="Audio player">
      <button
        className="audio-play"
        type="button"
        aria-label={label}
        disabled={loading}
        onClick={() => (playing ? pause() : void play(track, playback.status === "paused"))}
      >
        <span className="audio-play-icon">
          <PlaybackIcon paused={!playing} />
        </span>
        <span>{title}</span>
      </button>
      <span className="audio-duration muted" aria-label="Recording duration">
        {track === "intro" ? "0:52" : "0:08"}
      </span>
      {playback.track && (
        <button
          className="audio-stop"
          type="button"
          onClick={stop}
          aria-label="Stop audio"
          title="Stop audio"
        >
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
            <rect x="4" y="4" width="8" height="8" rx="1" />
          </svg>
        </button>
      )}
      {playback.status === "error" && (
        <span className="error audio-error" role="alert">
          Could not play audio. Retry or read the transcript.
        </span>
      )}
    </div>
  );
}
